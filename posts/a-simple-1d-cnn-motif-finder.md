---
date: 2026-02-27
title: A simple 1D CNN motif finder
tags:
  - genomics
  - programming
---

# A 1D CNN motif finder

## Motivation
I wanted to create a "baseline" simple 2-layer 1D CNN DNA motif detector for two reasons, one to check how good my alignment-based g4-finder tool was at doing the same thing. And second was to just bring back my `pytorch` syntax and coding muscle memory back, since it's been a while. 

The idea is to see how well a simple 1D CNN can detect a [g4 motif](https://en.wikipedia.org/wiki/G-quadruplex) in DNA nucleotide strings. You can also think of it as being  able to detect $k$ sized motifs with large $k$. Or, as $k$-mers with large $k$s (I run on $k=200$ here). 


This is a baseline exercise so I'm not going to juggle around nucleotide frequencies, for now. They're all roughly at 25%. 

## Helper functions
Let's create three helper functions, one to create a random sequence of nucleotides, one to add a g4 motif to any nucleotide string to create the positive tests. And a third to convert the nucleotides to one-hot-encoded vectors for `pytorch`. 

```python
def random_seq_generator(n_seqs: int, seq_size: int):
    nucl_sequences = "ATGC"
    a = ""

    my_nucl_list = []
    for i in range(n_seqs):
        for j in range(seq_size):
            a += random.choice(nucl_sequences)
        my_nucl_list.append(a)
        a = ""

    return my_nucl_list
```

And then, a way to add a g4 motif. 

```python
def plant_g4_motif(nucl_string: str, g4_motif: str):
    """
    take a nucleotide string, plant a g4 motif (predefined) inside the nucleotide string
    """

    nucl_string_len = len(nucl_string)
    g4_motif_len = len(g4_motif)
    assert nucl_string_len > g4_motif_len, "Length of nucleotide string less than the g4 motif, can't insert"

    start_index = random.choice(list(range(0,nucl_string_len-g4_motif_len + 1)))

    return nucl_string[:start_index] + g4_motif + nucl_string[start_index + g4_motif_len:]
```

Convert a nucleotide string to one-hot encoded vectors: 


Initially I thought I'd run it something like this 

```python
def encode_nucl(nucl_string: str):
    le = LabelEncoder()
    nucleotide_chars = list("ATGC")
    le.fit(nucleotide_chars)
    label_encoding = le.transform(list(nucl_string)) # returns an array
    label_tensors = torch.from_numpy(label_encoding)

    ohe = F.one_hot(label_tensors, num_classes = 4).float()

    return ohe
```

I changed it slightly. I didn't want to run `le.fit()` several times on the same set of nucleotides. This also gives me more control if I wanna use other nucleotides like `NYW` downstream. 

```python
def encode_nucl(nucl_string: str, fitted_le: sklearn.preprocessing._label.LabelEncoder):
    label_encoding = fitted_le.transform(list(nucl_string)) # returns an array
    label_tensors = torch.from_numpy(label_encoding)
    ohe = F.one_hot(label_tensors, num_classes = 4).float()

    return ohe

le = LabelEncoder()
le.fit(list("ATGC"))
```

## Gather the data
These helper functions let me quickly gather data and split them into positive and negative tests. And then shuffle them into one dataset.

these can be [argparsed](https://docs.python.org/3/library/argparse.html), but I'm gonna keep them as-is for the quick prototyping.
```python
n_positive, n_negative = 160, 160
k_mer_length = 200
g4_motif = "GGGTTAGGGTTAGGGTTAGGG"
```


Now let's create a bunch of tensors:
```python
random_seqs_set1 = random_seq_generator(n_positive, k_mer_length)
random_seqs_set2 = random_seq_generator(n_negative, k_mer_length)

positive_set = []
negative_set = []
for seq in random_seqs_set1:
    positive_set.append(encode_nucl(plant_g4_motif(seq, g4_motif), le))

for seq in random_seqs_set2:
    negative_set.append(encode_nucl(seq, le))


positive_set_tensor = torch.stack(positive_set).permute(0,2,1)
negative_set_tensor = torch.stack(negative_set).permute(0,2,1)

print(positive_set_tensor.shape, negative_set_tensor.shape)
# torch.Size([160, 4, 200]) torch.Size([160, 4, 200])
```

A couple of things here. The `.permute` for the two sets of tensors so that the `pytorch` [1D CNN](https://docs.pytorch.org/docs/2.13/generated/torch.nn.Conv1d.html) doesn't look at the wrong dimensions, it expects $(N, C, L)$. And `torch.stack`, the way I've written it stacks it as $(N, L, C)$. Finally, let's assemble `X` and `y`, and shuffle them so the positives and negatives are mixed.

```python
X = torch.cat([positive_set_tensor, negative_set_tensor])
y = torch.cat([torch.ones(n_positive), torch.zeros(n_negative)]).unsqueeze(1)

shuffle = torch.randperm(len(y))
X, y = X[shuffle], y[shuffle]
```


## Run the training loop


Finally, the model: 

```python
class OneDCnnMotif(nn.Module):
    def __init__(self, kernel_size):
        super().__init__()
        self.layer1 = nn.Conv1d(4, 16, kernel_size = kernel_size)
        self.relu = nn.ReLU()
        self.layer2 = nn.Linear(16, 1)

    def forward(self, x):
        x = self.layer1(x)
        x = self.relu(x)
        x = x.max(dim=2).values
        x = self.layer2(x)
        return x
```


Training loop, these hyperparameters were decided by random guesses based empirically on what I've learnt.

80/20 train/test split, Adam, and `BCEWithLogitsLoss` since the model outputs a raw score, not a probability. The dataset is tiny, so I train on the whole training set at once instead of batching.

```python
def train_and_test(X, y, kernel_size=12, epochs=50, lr=0.01):
    n_train = int(0.8 * len(y))
    X_train, X_test = X[:n_train], X[n_train:]
    y_train, y_test = y[:n_train], y[n_train:]

    model = OneDCnnMotif(kernel_size)
    loss_fn = nn.BCEWithLogitsLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    for epoch in range(epochs):
        model.train()
        optimizer.zero_grad()
        loss = loss_fn(model(X_train), y_train)
        loss.backward()
        optimizer.step()
        if epoch % 10 == 0:
            print(f"epoch {epoch}  loss {loss.item():.4f}")

    model.eval()
    with torch.no_grad():
        preds = (model(X_test) > 0).float()
    print(f"test accuracy: {(preds == y_test).float().mean().item():.3f}")
    return model

model = train_and_test(X, y)
# epoch 0  loss 0.8676
# epoch 10  loss 0.6690
# epoch 20  loss 0.5978
# epoch 30  loss 0.4853
# epoch 40  loss 0.3245
# test accuracy: 1.000
```

100% on the test set. That sounds great, but it's a very easy task: one fixed 21 bp string planted in random sequence.

## Add some real biology to our prototype
There are a lot of caveats to our current prototype. I'll list them out one by one and suggest small fixes. 

First, the nucleotides are completely random, and of roughly equal frequencies. We can change that by controlling the gc content of the randomly generated nucleotide string. 

```python
def random_seq_generator(n_seqs: int, seq_size: int, gc: float = 0.5):
    nucl_sequences = "ATGC"
    nucl_weights = [(1 - gc) / 2, (1 - gc) / 2, gc / 2, gc / 2] 
    a = ""

    my_nucl_list = []
    for i in range(n_seqs):
        for j in range(seq_size):
            a += random.choices(nucl_sequences, weights=nucl_weights)[0]
        my_nucl_list.append(a)
        a = ""
        
    return my_nucl_list
```

Second, G4 motifs are not a single string, they're a specific grammar within the set of nucleotides. This version can be represented as a [regular expression](https://doi.org/10.1093/nar/gki609) instead of a fixed string to make it a little more accurate. 

```python
import re
G4 = re.compile(r"G{3,}[ACGT]{1,7}G{3,}[ACGT]{1,7}G{3,}[ACGT]{1,7}G{3,}")
```

To plant a different G4 every time, generate one from the same grammar: four runs of 3-5 Gs, separated by loops of 1-7 random bases.

```python
def random_g4():
    g4 = ""
    for i in range(4):
        g4 += "G" * random.randint(3, 5)
        if i < 3:
            g4 += "".join(random.choices("ACGT", k=random.randint(1, 7)))
    return g4
```

Third, a random negative can contain a G4 by chance. Use the regex to drop those, so the negatives are actually negative. I should've probably included that in the first pass above, but oh well. 

```python
pos = [plant_g4_motif(s, random_g4()) for s in random_seq_generator(n_positive, k_mer_length)]
neg = [s for s in random_seq_generator(2 * n_negative, k_mer_length) if not G4.search(s)][:n_negative]
```

## Results

| Setup | Test accuracy |
|---|---|
| Fixed motif, 50% GC | 1.000 |
| Fixed-motif model, tested on varied G4s | 0.497 |
| Retrained on varied G4s, 50% GC | 0.953 |
| Retrained on varied G4s, 65% GC | 0.875 |

The fixed-motif model scores at chance on varied G4s. It learned that one string, not what a G4 is. Retraining on varied G4s fixes most of that. Raising the GC content makes it harder again: G-runs show up more often in the background, and 9 of 320 random negatives already contained a G4 by chance.

These test sets are only 64 sequences, so treat the numbers as rough.

Next, I'll run my alignment-based tool, `pg4findr` (https://github.com/artorias111/pg4findr), on the same test sets and add it to the table. (Coming soon!)