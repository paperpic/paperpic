---
title: トラブルシューティング
description: PaperPic のビューアーに高さやスタイルがない、Tailwind CSS で見た目が変わる、画像が読み込めない・編集できない、適用中にページが固まる、大きな写真で失敗する、といったときの対処法。
---

# トラブルシューティング

PaperPic の問題の多くは、画像ではなくセットアップが原因です。見えている症状を探すと、そのすぐ下に対処法があります。

## ビューアーが細い帯になる、または表示されない {#no-height}

ビューアーはコンテナいっぱいに広がるので、高さのないコンテナではビューアーの最小の高さ（16rem）まで縮みます。コンテナに `height: 480px` のような高さを与えるか、高さを決める flex や grid のレイアウトに置いてください。どちらの方法も[スタイル](./styling)にあります。

## ボタンにスタイルがなく、コンソールに警告が出る {#no-stylesheet}

コンソールに `PaperPic: the stylesheet is missing, so the viewer has no layout.` と出ます。アプリでスタイルシートを一度読み込んでください。`@paperpic/core/style.css`、または `@paperpic/vue` か `@paperpic/react` の `style.css` です。

## Tailwind CSS でビューアーの枠線と余白が消える {#tailwind}

カスケードレイヤーの順番が違うと、Tailwind CSS 4 のリセットが PaperPic のスタイルシートに勝ちます。両方を読み込む前にレイヤーに名前を付けてください。方法は[スタイル](./styling#tailwind)にあります。

## 画像は表示されるが、編集に失敗する {#other-origin}

[`error`](../reference/events#error) が、画像が別のオリジンから来ていると伝えます。ブラウザーはそうした画像のピクセルを PaperPic に読ませません。画像は自分で取得して `Blob` を渡してください。方法は[画像の読み込み](./loading#fetch)にあります。

## 画像が読み込めない {#load-error}

ビューアーに画像を読み込めなかったと表示され、`error` が `phase: 'load'` 付きで届きます。URL が存在するか、ブラウザーがその形式を開けるかを確認してください。HEIC は Safari でしか開けず、SVG には `width` と `height` の属性が必要です。形式の一覧は[画像の読み込み](./loading#formats)にあります。

## 適用中にページが固まる {#worker}

worker が起動せず、編集がメインスレッドで動いています。動作はしますが、大きな写真ではページが少しのあいだ固まります。よくある原因は次のとおりです。

- `worker-src 'self'` を許可していない Content Security Policy、または `default` policy なしで Trusted Types を必須にしているもの。許可すべきものは[パフォーマンスと対応環境](./performance)にあります。
- ページとは別のオリジンの CDN からパッケージを読み込んでいる。ブラウザーはページのオリジンからしか worker を起動しません。

ブラウザーのネットワークパネルで、ページが worker のファイルを要求したかを確認できます。ファイル名は `worker` で始まります。

## 大きな写真で適用に失敗する {#too-large}

`error` に `The browser could not read an image of …` または `could not save an image of …` と出ます。ブラウザーは canvas の大きさを制限しており、iOS の Safari が最も厳しい制限です。[`maxOutputSize`](../reference/options#maxoutputsize) をたとえば 3000 ピクセルに設定してください。文書は十分に読めます。

## ホイールでページがスクロールせず、画像がズームする {#wheel}

[`wheelZoom: false`](../reference/options#wheelzoom) を設定してください。ボタン、キーボード、ピンチではズームできます。
