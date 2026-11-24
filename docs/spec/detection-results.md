# Document detection results

**Status:** in Straighten. It does not meet its criterion on [new photos](#new-photos): it finds 48.2% of the documents, with 5.2% of false proposals. In cross-validation, over the photos it was designed with, it does. Measured on 2026-11-23 and 2026-11-24 on desktop. Phones are not measured.

Straighten looks for the document as it opens ([D72](paperpic-component.md#decisions)). This page holds the measurements behind it.

The code is in `packages/core/src/processing/detection`. `pnpm dev:bench` times it on a photo of your own: nothing is uploaded or saved.

## How it works

1. **Copy.** The viewer reads the image at 800 px on its longest side, with the edits of its shape, and the search reduces it to 256 px.
2. **Text.** A morphological closing removes the text, whose edges would compete with those of the paper. The search runs on the copy with and without text, because the closing also hurts some papers.
3. **Lines.** The edges of the color channels vote for straight lines, as Hough proposes. The borders of the photo count as lines too, for documents that the photo cuts off.
4. **Shapes.** Every two pairs of facing lines form a shape. The best 20 of each copy stay, and their corners climb to where their sides lie better on the edges.
5. **Confidence.** A linear score over 12 features of each shape, such as how well its outline lies on edges, its size, the contrast between its two sides, how smooth its inside is, and whether its sides go on past its corners. The best shape is proposed if its score is above 0.

## Conclusions

The criterion was set before any code: at least 60% of the documents found, and fewer than 5% of the photos with a false proposal.

| Question                         | Answer                                                                                                                                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Does it meet the criterion?      | Not on new photos: it finds 48.2% of the documents, with 5.2% of false proposals. In cross-validation, yes: 60.9%, with 4.0%. With the weights and the threshold of one half of those photos, it finds 60.6% in the other half, with 5.2%. |
| Is it better than the libraries? | Yes. The best classical one finds 25.9% without a threshold, and 17.9% with under 5% of false proposals.                                                                                                                                   |
| Is it fast enough?               | Yes on desktop: 100 to 180 ms in the worker the first time, and 70 ms once the code is warm. Phones are not measured: in the [spike](spike-results.md#android), our JavaScript was 5 to 7 times slower on a top Android phone.             |

## Photos

- **Documents:** 251 photos from the test split of `mapo80/DocCornerDataset`, used locally and never in the repository. Identity documents were removed by hand.
- **No document:** 132 photos of COCO, from the same dataset.
- **Everyday photos:** 21 photos of our own and from the samples of jscanify and Scanic, judged by eye. Two pairs are near duplicates. The weights are not fitted to them.
- **New images:** 21 more, judged by eye: 11 photos and scans of invoices and receipts, and 10 stock photos, mock-ups and drawings of invoices. The weights are not fitted to them either, but their failures suggested the last features, so they are no test of those.
- **Painted shadows:** the same 383 photos, with a [shadow](#hard-shadows) painted over half of each one.
- **New photos:** 386 documents and 210 photos without one, which nothing was designed with. Their [section](#new-photos) says where they come from.

A document is **found** if the proposal overlaps the real one by at least 0.9 (intersection over union), and **near** from 0.75 to 0.9. A proposal is **false** under 0.75, or in a photo without a document.

## Rates

Cross-validated over the 383 photos, with the mean of 4 ways to split them into 5 parts. The threshold moves the confidence that a proposal needs, and 0 is the one in use.

| Threshold     | Found | Near  | Wrong, on documents | Wrong, without one | False, in total |
| ------------- | ----- | ----- | ------------------- | ------------------ | --------------- |
| None          | 67.7% | 18.7% | 13.5%               | 100%               | 43.3%           |
| -0.75         | 64.9% | 16.1% | 6.3%                | 7.6%               | 6.7%            |
| -0.25         | 62.7% | 14.1% | 3.7%                | 5.9%               | 4.4%            |
| **0, in use** | 60.9% | 13.2% | 3.3%                | 5.3%               | 4.0%            |
| 0.5           | 55.9% | 10.3% | 2.5%                | 4.0%               | 3.0%            |
| 1             | 54.1% | 7.8%  | 1.3%                | 3.4%               | 2.0%            |

A stricter test takes the weights and the threshold from one half of the photos, the even or the odd rows of the dataset, and measures on the other half. The features were still chosen with all the photos, so a fair test needs [new ones](#new-photos).

| Search                      | Even rows on the odd ones | Odd rows on the even ones |
| --------------------------- | ------------------------- | ------------------------- |
| Prototype                   | 50.8% found, 6.2% false   | Not measured              |
| First version, 11 features  | 53.4% found, 7.3% false   | 44.4% found, 2.9% false   |
| Second version, 12 features | 59.3% found, 5.6% false   | 58.6% found, 2.9% false   |
| In use, 12 features         | 59.3% found, 5.6% false   | 61.7% found, 4.9% false   |

| Same 383 photos                 | Found | False proposals                      |
| ------------------------------- | ----- | ------------------------------------ |
| Our search, without a threshold | 67.7% | Every photo without a document       |
| Our search                      | 60.9% | 4.0%                                 |
| Scanic 1.8.0, classical         | 25.9% | About every photo without a document |
| Scanic 1.8.0, with a confidence | 17.9% | Under 5%                             |
| jscanify                        | 21.9% | About every photo without a document |

Scanic also has a learned model. It needs about 2 MB from a CDN, which conflicts with no dependencies and no requests of its own.

## New photos

The photos, the detectors and the criterion were set before any download, and nothing was adjusted to the result. Each photo is read as the viewer does. The second version is the one of 0.6.0.

| Photos                  | Second version                   | In use                           |
| ----------------------- | -------------------------------- | -------------------------------- |
| Receipts, 195           | 46.2% found, 10.8% near, 7 wrong | 51.8% found, 7.2% near, 8 wrong  |
| Documents, 191          | 42.4% found, 7.3% near, 16 wrong | 44.5% found, 7.9% near, 15 wrong |
| **Both, 386**           | **44.3% found**, 9.1% near       | **48.2% found**, 7.5% near       |
| Without a document, 210 | 7 proposed                       | 8 proposed                       |
| **False, of 596**       | **30, which is 5.0%**            | **31, which is 5.2%**            |

- **Receipts:** [hand-captured images of restaurant receipts](https://zenodo.org/records/13688441), CC BY 4.0. Three repeated photos were left out, one of them an everyday photo.
- **Documents:** 200 photos at random of the 1094 of [A New Image Dataset for Document Corner Localization](https://data.mendeley.com/datasets/x3nm4cxr83), CC BY 4.0. Left out: 6 whose four corners are impossible, and 3 whose corners take less than 2% of the photo, where the search looks for nothing.
- **Without a document:** photos of COCO at random, from the validation split of the same dataset as the 132.

What they say:

- **The version in use is better.** 23 documents came to be found and 8 stopped being so, which chance alone would do about once in a hundred times. The false proposals are the same within noise.
- **The cross-validation was optimistic.** These photos are harder, or the 383 shaped the design too much.
- **The confidence loses about half of the rest.** The right shape is among the candidates in 70.8% of the receipts and 75.4% of the documents.
- **The extremes are worst.** It finds 34.7% of the 72 receipts that take more than three quarters of the photo, and 32.4% of the 34 documents that take from a tenth to a quarter of it.

Some of the wrong ones can be mistakes in the corners of the documents, which nobody has reviewed. How many of the photos have a hard shadow is unknown.

These photos stay a test only while nothing is fitted to them or chosen by them.

## What the new images changed

The first version was run on the new images before anything was fitted to them, and it was wrong in 3 of 21. In most of its failures, there and on the 383 photos, the right shape was among the candidates and lost to a part of the page, up to a fold or a printed band.

| Images                           | First version: right, almost, wrong, silent | Second version | In use      |
| -------------------------------- | ------------------------------------------- | -------------- | ----------- |
| Photos and scans, 11             | 6, 1, 1, 3                                  | 7, 1, 0, 3     | 8, 1, 0, 2  |
| Stock, mock-ups and drawings, 10 | 3, 1, 2, 4                                  | 3, 1, 2, 4     | 3, 1, 2, 4  |
| Everyday photos, 21              | 15, 0, 0, 6                                 | 18, 0, 0, 3    | 18, 0, 0, 3 |

Two changes to the features made the second version:

- **Sides that go on.** A part of a page has a side whose two neighbours go on past it, along the edges of the page.
- **Light as a ratio.** Contrasts and tones are compared as a ratio, so a shadow over the page counts less. The colorfulness and the brightness of the inside added nothing then.

These did not help:

- A last adjustment of the corners on a larger copy: of 202 proposals, 159 were found before it, 156 after it at 384 px, and 153 at 512 px.
- A third set of edges, relative to their surroundings, for paper on a table of almost its color.
- More shapes: 40 of each copy found no more. With 12, it found 2.5 points fewer.
- Sides that go on in any direction of contrast: better on mock-ups with a dark header, and worse on photos.

Nor did these, tried on the second version for the thin dark frame of a mock-up, which the closing erases, and for paper on a table of almost its color:

- A closing of 3, 2 or 1 px in place of 4: it found 58.5%, 58.7% and 57.1%, with 5.0%, 5.2% and 6.1% of false proposals.
- A second closing, of 2 px, to measure only the outline: it found 60.7% with two more features, and 60.3% with the better of the two outlines.
- Fainter edges, with a least strength of 6 or 4 levels in place of 10: it found 60.3% and 60.1%, with 4.6% and 4.4% of false proposals. One of the silent photos got the right shape as a candidate, below the threshold.

## Hard shadows

The second version compared the bright places of the inside of a shape with the dark ones. A hard shadow over the page, such as that of the hand that holds the phone, makes them differ a lot, so the right shape lost its confidence.

The version in use compares each place of the inside with the next ones instead. This **roughness** is the step of light that a quarter of the pairs are above. Few pairs are at both sides of the border of a shadow, so it counts little. With a fifth or three tenths of the pairs, the rates are the same within noise.

To measure it, a shadow was painted over the 383 photos. Its border is a straight line through the middle of the document, or of the photo if it has none, at an angle that changes from photo to photo. It takes the light away as a real one does, in linear light, and its border is 6 px wide, or 160 px if it is soft, on photos of up to 800 px. The weights are fitted to the photos without a shadow, and never to the one they are tried on.

| Light in the shadow | Second version           | In use                  |
| ------------------- | ------------------------ | ----------------------- |
| No shadow           | 60.9% found, 4.0% false  | 60.9% found, 4.0% false |
| A half              | 49.0% found, 7.0% false  | 55.4% found, 5.7% false |
| A quarter           | 26.3% found, 10.7% false | 53.4% found, 6.5% false |
| An eighth           | 5.6% found, 15.9% false  | 51.4% found, 6.0% false |
| A half, soft        | 55.8% found, 2.9% false  | 57.8% found, 3.7% false |
| A quarter, soft     | 35.5% found, 2.3% false  | 51.4% found, 3.9% false |

One of the new images has such a shadow. The second version left it silent, and this one finds it. A fair test needs more photos like it.

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

- **Silent where a person sees the document at once:** a receipt on a table of almost its color, a crumpled one that fills the photo.
- **A part of the page, on a table of almost its color:** a receipt on light tiles lost its last fifth, with its QR code.
- **A page with a dark header** that blends into the background loses the header, and so do two pages that overlap, which come out as one.
- **Straight sides only.** The four corners are on straight lines, so a curved receipt can lose its last lines.
- **A coarse grid.** A corner moves in steps of 1 px of the 256 px copy, which is 0.4% of the photo.
- **The photos lean on sheets and receipts.** Cards and colored paper are few.
