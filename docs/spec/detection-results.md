# Document detection results

**Status:** in Straighten. It meets its criterion in cross-validation, and misses it by one point in the stricter test below. Measured on 2026-11-23 on desktop. Phones are not measured.

Straighten looks for the document as it opens ([D72](paperpic-component.md#decisions)). This page holds the measurements behind it.

The code is in `packages/core/src/processing/detection`. `pnpm dev:bench` times it on a photo of your own: nothing is uploaded or saved.

## How it works

1. **Copy.** The viewer reads the image at 800 px on its longest side, with the edits of its shape, and the search reduces it to 256 px.
2. **Text.** A morphological closing removes the text, whose edges would compete with those of the paper. The search runs on the copy with and without text, because the closing also hurts some papers.
3. **Lines.** The edges of the color channels vote for straight lines, as Hough proposes. The borders of the photo count as lines too, for documents that the photo cuts off.
4. **Shapes.** Every two pairs of facing lines form a shape. The best 20 of each copy stay, and their corners climb to where their sides lie better on the edges.
5. **Confidence.** A linear score over 12 features of each shape, such as how well its outline lies on edges, its size, the contrast between its two sides, and whether its sides go on past its corners. The best shape is proposed if its score is above 0.

## Conclusions

The criterion was set before any code: at least 60% of the documents found, and fewer than 5% of the photos with a false proposal.

| Question                         | Answer                                                                                                                                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Does it meet the criterion?      | In cross-validation, yes: it finds 60.9% of the documents, with 4.0% of false proposals. With the weights and the threshold of one half of the photos, it finds 59.0% in the other half, with 4.2%.                            |
| Is it better than the libraries? | Yes. The best classical one finds 25.9% without a threshold, and 17.9% with under 5% of false proposals.                                                                                                                       |
| Is it fast enough?               | Yes on desktop: 100 to 180 ms in the worker the first time, and 70 ms once the code is warm. Phones are not measured: in the [spike](spike-results.md#android), our JavaScript was 5 to 7 times slower on a top Android phone. |

## Photos

- **Documents:** 251 photos from the test split of `mapo80/DocCornerDataset`, used locally and never in the repository. Identity documents were removed by hand.
- **No document:** 132 photos of COCO, from the same dataset.
- **Everyday photos:** 21 photos of our own and from the samples of jscanify and Scanic, judged by eye. Two pairs are near duplicates. The weights are not fitted to them.
- **New images:** 21 more, judged by eye: 11 photos and scans of invoices and receipts, and 10 stock photos, mock-ups and drawings of invoices. The weights are not fitted to them either, but their failures suggested the last features, so they are no test of those.

A document is **found** if the proposal overlaps the real one by at least 0.9 (intersection over union), and **near** from 0.75 to 0.9. A proposal is **false** under 0.75, or in a photo without a document.

## Rates

Cross-validated over the 383 photos, with the mean of 4 ways to split them into 5 parts. The threshold moves the confidence that a proposal needs, and 0 is the one in use.

| Threshold     | Found | Near  | Wrong, on documents | Wrong, without one | False, in total |
| ------------- | ----- | ----- | ------------------- | ------------------ | --------------- |
| None          | 68.0% | 19.1% | 12.8%               | 100%               | 42.9%           |
| -0.75         | 64.9% | 15.6% | 5.3%                | 8.9%               | 6.5%            |
| -0.25         | 62.0% | 13.8% | 3.5%                | 6.8%               | 4.6%            |
| **0, in use** | 60.9% | 12.6% | 2.9%                | 6.1%               | 4.0%            |
| 0.5           | 57.3% | 10.4% | 2.2%                | 5.1%               | 3.2%            |
| 1             | 53.7% | 7.7%  | 1.3%                | 3.2%               | 2.0%            |

A stricter test takes the weights and the threshold from one half of the photos, the even or the odd rows of the dataset, and measures on the other half. The features were still chosen with all the photos, so a fair test of any change needs new ones.

| Search                     | Even rows on the odd ones | Odd rows on the even ones |
| -------------------------- | ------------------------- | ------------------------- |
| Prototype                  | 50.8% found, 6.2% false   | Not measured              |
| First version, 11 features | 53.4% found, 7.3% false   | 44.4% found, 2.9% false   |
| In use, 12 features        | 59.3% found, 5.6% false   | 58.6% found, 2.9% false   |

| Same 383 photos                 | Found | False proposals                      |
| ------------------------------- | ----- | ------------------------------------ |
| Our search, without a threshold | 68.0% | Every photo without a document       |
| Our search                      | 60.9% | 4.0%                                 |
| Scanic 1.8.0, classical         | 25.9% | About every photo without a document |
| Scanic 1.8.0, with a confidence | 17.9% | Under 5%                             |
| jscanify                        | 21.9% | About every photo without a document |

Scanic also has a learned model. It needs about 2 MB from a CDN, which conflicts with no dependencies and no requests of its own.

## What the new images changed

The first version was run on the new images before anything was fitted to them, and it was wrong in 3 of 21. In most of its failures, there and on the 383 photos, the right shape was among the candidates and lost to a part of the page, up to a fold or a printed band.

| Images                           | First version: right, almost, wrong, silent | In use      |
| -------------------------------- | ------------------------------------------- | ----------- |
| Photos and scans, 11             | 6, 1, 1, 3                                  | 7, 1, 0, 3  |
| Stock, mock-ups and drawings, 10 | 3, 1, 2, 4                                  | 3, 1, 2, 4  |
| Everyday photos, 21              | 15, 0, 0, 6                                 | 18, 0, 0, 3 |

Two changes to the features did it:

- **Sides that go on.** A part of a page has a side whose two neighbours go on past it, along the edges of the page.
- **Light as a ratio.** Contrasts and tones are compared as a ratio, so a shadow over the page counts less. The colorfulness and the brightness of the inside added nothing then.

These did not help:

- A last adjustment of the corners on a larger copy: of 202 proposals, 159 were found before it, 156 after it at 384 px, and 153 at 512 px.
- A third set of edges, relative to their surroundings, for paper on a table of almost its color.
- More shapes: 40 of each copy found no more. With 12, it found 2.5 points fewer.
- Sides that go on in any direction of contrast: better on mock-ups with a dark header, and worse on photos.

## From the prototype

The prototype had 18 features and tried up to 80 shapes, in 694 ms (median, Node.js). These changes kept its rate, cross-validated on the even rows of the dataset, which it was tuned on:

| Change                                                                              | Time   | Found, with under 5% of false |
| ----------------------------------------------------------------------------------- | ------ | ----------------------------- |
| Prototype                                                                           | 694 ms | 56.4%                         |
| The same shapes in faster code, with 11 features, because the other 7 added nothing | 206 ms | 60.2%                         |
| 20 shapes of each copy, and none that repeats another                               | 93 ms  | 59.4%                         |
| A sample of each side every 2 pixels                                                | 68 ms  | 61.7%                         |

The differences between these rates are noise, since one photo is 0.75%. Before the cuts, on 30 of the photos, 2186 of the 2188 shapes of the prototype came out in the same place.

## Known limits

- **Silent where a person sees the document at once:** a receipt on a table of almost its color, one held by hand under a hard shadow, a crumpled one that fills the photo.
- **A page with a dark header** that blends into the background loses the header, and so do two pages that overlap, which come out as one.
- **Straight sides only.** The four corners are on straight lines, so a curved receipt can lose its last lines.
- **A coarse grid.** A corner moves in steps of 1 px of the 256 px copy, which is 0.4% of the photo.
- **The photos lean on sheets and receipts.** Cards and colored paper are few.
