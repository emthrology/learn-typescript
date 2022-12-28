## 코로나 세계 현황판 만들기

## 자바스크립트 프로젝트에 타입스크립트 적용하기

0. JSDoc으로 타입시스템 적용해보기

1. 타입스크립트 기본환경 구성
   - [x] NPM 초기화 : `npm init`
   - [x] 타입스크립트 라이브러리 설치 : `npm i typescript --save-dev`
   - [x] 타입스크립트 설정 파일 생성 및 기본 값 추가 : `tsconfig.json` 생성
   - [x] 자바스트립트 파일을 타입스크립트 파일로 변환
   * 별도의 빌드시스템이 적용된 경우 위의 환경구성 이후 소스코드만 옮겨와서 변환하기를 추천
2. 명시적인 `any` 선언하기(비숙련자)
   - `tsconfig.json` 에 `noImplicitAny` : `true`
   - 표시되는 에러에 any 타입 일단 넣기
   - 타입 구체화 작업 진행 : 가능한 한 구체적인 타입으로
3. 프로젝트 환경 구성
   - babel, eslint, prettrier etc.
4. 외부 라이브러리 모듈화

## 참고 자료

- [존스 홉킨스 코로나 현황](https://www.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6)
- [Postman API](https://documenter.getpostman.com/view/10808728/SzS8rjbc?version=latest#27454960-ea1c-4b91-a0b6-0468bb4e6712)
- [Type Vue without Typescript](https://blog.usejournal.com/type-vue-without-typescript-b2b49210f0b)
