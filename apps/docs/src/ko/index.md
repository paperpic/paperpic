---
layout: home
title: PaperPic
titleTemplate: 문서 이미지 뷰어 및 편집기
description: 오픈 소스 문서 이미지 뷰어 및 편집기. 확대/축소, 회전, 원근 보정, 밝기 및 대비 조정, 흑백 변환, 그림자 제거를 지원합니다.

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: 문서 이미지를 제대로
  tagline: 문서 사진을 보고 편집하세요. 확대/축소, 회전, 원근 보정, 밝기 및 대비 조정, 깔끔한 흑백 변환, 그림자 제거가 가능합니다.
  actions:
    - theme: brand
      text: 시작하기
      link: /ko/guide/getting-started
    - theme: alt
      text: 플레이그라운드
      link: /ko/playground
    - theme: alt
      text: GitHub
      link: https://github.com/paperpic/paperpic

features:
  - icon: { src: /icons/viewer.svg, wrap: true, width: 24, height: 24 }
    title: "뷰어"
    details: "버튼, 휠, 핀치로 확대/축소하고, 이미지를 이동하고, 긴 영수증은 너비에 맞춥니다. 필요하면 읽기 전용으로 쓸 수 있습니다."
    link: /ko/guide/viewer
  - icon: { src: /icons/perspective.svg, wrap: true, width: 24, height: 24 }
    title: "기울기 보정과 자르기"
    details: "네 모서리를 끌어 비스듬히 찍은 사진을 평평한 페이지로 만듭니다. 비율은 추정하거나 지정할 수 있습니다."
    link: /ko/guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "정리"
    details: "그림자 진 사진을 선명한 흑백으로 바꾸고, 컬러 문서는 밝기와 대비를 조정합니다."
    link: /ko/guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "원본 해상도"
    details: "적용하면 편집한 이미지를 Blob으로 코드에 넘깁니다. 처리는 Web Worker에서 이루어져 페이지가 계속 반응합니다."
    link: /ko/guide/saving
  - icon: { src: /icons/keyboard.svg, wrap: true, width: 24, height: 24 }
    title: "접근성"
    details: "키보드 단축키, 화살표 키로 움직이는 모서리 핸들, 스크린 리더를 위한 안내."
    link: /ko/guide/accessibility
  - icon: { src: /icons/frameworks.svg, wrap: true, width: 24, height: 24 }
    title: "모든 프레임워크"
    details: "순수 JavaScript용 코어와 Vue, React용 가벼운 래퍼. 런타임 의존성이 없습니다."
    link: /ko/guide/getting-started

comparison:
  before: /home-before.webp
  after: /home-after.webp
  label: "사진과 결과 비교하기"
  beforeLabel: "사진"
  afterLabel: "PaperPic"
  beforeAlt: "탁자 위 영수증을 비스듬히 찍은 사진으로, 일부가 그림자에 가려져 있습니다"
  afterAlt: "같은 영수증을 기울기 보정하고 흑백으로 정리한 결과"
---
