// //라이브러리 로딩
// import 변수명 from '라이브러리 이름'
// //변수, 함수 임포트
// import {} from '파일 상대 경로'
import axios, { AxiosResponse } from 'axios'; //타입 정의가 필요없는 라이브러리
import Chart from 'chart.js/auto'; //타입 정의가 필요했던 라이브러리
// -> 타입 정의가 없는 라이브러리의 경우 tsconfig에 "typeRoots" 에 경로 추가 후 라이브러리이름의 폴더 별로 index.d.ts 추가
// import * as Chart from 'chart.js'; //CommonJS 모듈로부터 불러올 경우 쓰이는 양식

import {
  CovidSummaryResponse,
  CountrySumarryResponse,
  CovidConfirmedDetail,
  Country,
} from './covid';

// utils
function $<T extends HTMLElement>(selector: string) {
  //$ 함수는 HTMLElement타입과 그 자손타입만 접근가능?
  const element = document.querySelector(selector);
  return element as T; //타입단언을 셀렉터 함수에서 미리 해놓고
}
function getUnixTimestamp(date: Date | string) {
  //대부분 api에서 date는 string 타입으로 보내므로
  return new Date(date).getTime();
}

// DOM
// `as` 로 `타입 단언` 해준다
// const confirmedTotal = $('.confirmed-total') as HTMLSpanElement;
// const deathsTotal = $('.deaths') as HTMLParagraphElement;
// const recoveredTotal = $('.recovered') as HTMLParagraphElement; //HTMLParagraphElement는 Element(ts기본 내장 인터페이스)의 확장 인터페이스이고 'innerText' 프로퍼티를 명시하고있다
// const lastUpdatedTime = $('.last-updated-time') as HTMLParagraphElement; //클래스가 쓰이는 element의 종류에 따라 확장 인터페이스도 달라짐
// const lineChart = $('#lineChart') as HTMLCanvasElement;
// const rankList = $('.rank-list') as HTMLOListElement;
// const deathsList = $('.deaths-list') as HTMLOListElement;
// const recoveredList = $('.recovered-list') as HTMLOListElement;
// const deathSpinner = createSpinnerElement('deaths-spinner');
// const recoveredSpinner = createSpinnerElement('recovered-spinner');

const confirmedTotal = $<HTMLSpanElement>('.confirmed-total');
const deathsTotal = $<HTMLParagraphElement>('.deaths');
const recoveredTotal = $<HTMLParagraphElement>('.recovered');
const lastUpdatedTime = $<HTMLParagraphElement>('.last-updated-time');
const lineChart = $<HTMLCanvasElement>('#lineChart');
const rankList = $<HTMLOListElement>('.rank-list');
const deathsList = $<HTMLOListElement>('.deaths-list');
const recoveredList = $<HTMLOListElement>('.recovered-list');
const deathSpinner = createSpinnerElement('deaths-spinner');
const recoveredSpinner = createSpinnerElement('recovered-spinner');
let casesChart: Chart;

function createSpinnerElement(id: string) {
  const wrapperDiv = document.createElement('div');
  wrapperDiv.setAttribute('id', id);
  wrapperDiv.setAttribute(
    'class',
    'spinner-wrapper flex justify-center align-center'
  );
  const spinnerDiv = document.createElement('div');
  spinnerDiv.setAttribute('class', 'ripple-spinner');
  spinnerDiv.appendChild(document.createElement('div'));
  spinnerDiv.appendChild(document.createElement('div'));
  wrapperDiv.appendChild(spinnerDiv);
  return wrapperDiv;
}
function createParagraphElement(id: string, message: string) {
  const paragraphDiv = document.createElement('div');
  paragraphDiv.setAttribute('id', id);
  const paragraph = document.createElement('p');
  paragraph.innerText = message;
  paragraphDiv.appendChild(paragraph);
  return paragraphDiv;
}

// state
let isDeathLoading = false;

// api
function fetchCovidSummary(): Promise<AxiosResponse<CovidSummaryResponse>> {
  const url = 'https://api.covid19api.com/summary';
  return axios.get(url);
}

enum CovidStatus {
  Confirmed = 'confirmed',
  Recovered = 'recovered',
  Deaths = 'deaths',
}

function fetchCountryInfo(
  countryName: string | undefined,
  status: CovidStatus
): Promise<AxiosResponse<CountrySumarryResponse>> {
  // params: confirmed, recovered, deaths
  const url = `https://api.covid19api.com/country/${countryName}/status/${status}`;
  return axios.get(url);
}

// methods
function startApp() {
  setupData();
  initEvents();
}

// events
function initEvents() {
  if (!rankList) return;
  rankList.addEventListener('click', handleListClick);
}

async function handleListClick(event: Event) {
  let selectedId;
  if (casesChart !== undefined) casesChart.destroy();
  if (
    event.target instanceof HTMLParagraphElement ||
    event.target instanceof HTMLSpanElement
  ) {
    selectedId = event.target.parentElement?.id;
  }
  if (event.target instanceof HTMLLIElement) {
    selectedId = event.target.id;
  }
  if (isDeathLoading) {
    return;
  }
  clearDeathList();
  clearRecoveredList();
  startLoadingAnimation();
  isDeathLoading = true;
  const { data: deathResponse } = await fetchCountryInfo(
    selectedId,
    CovidStatus.Deaths
  );
  const { data: recoveredResponse } = await fetchCountryInfo(
    selectedId,
    CovidStatus.Recovered
  );
  const { data: confirmedResponse } = await fetchCountryInfo(
    selectedId,
    CovidStatus.Confirmed
  );
  endLoadingAnimation();
  setDeathsList(deathResponse);
  setTotalDeathsByCountry(deathResponse);
  setRecoveredList(recoveredResponse);
  setTotalRecoveredByCountry(recoveredResponse);
  setChartData(confirmedResponse);
  isDeathLoading = false;
}

function setDeathsList(data: CountrySumarryResponse) {
  const sorted = data.sort(
    (a: CovidConfirmedDetail, b: CovidConfirmedDetail) =>
      getUnixTimestamp(b.Date) - getUnixTimestamp(a.Date)
  );
  sorted.forEach((value: CovidConfirmedDetail) => {
    const li = document.createElement('li');
    li.setAttribute('class', 'list-item-b flex align-center');
    const span = document.createElement('span');
    span.textContent = value.Cases.toString();
    span.setAttribute('class', 'deaths');
    const p = document.createElement('p');
    p.textContent = new Date(value.Date).toLocaleDateString().slice(0, -1);
    li.appendChild(span);
    li.appendChild(p);
    deathsList.appendChild(li); //타입 단언(type assertion) - non null 선언 : 디버깅에 방해가 될 수 있으므로 주의해서 적용해야 한다
  });
}

function clearDeathList() {
  deathsList.innerHTML = '';
}

function setTotalDeathsByCountry(data: CountrySumarryResponse) {
  deathsTotal.innerText = data[0].Cases.toString();
}

function setRecoveredList(data: CountrySumarryResponse) {
  const sorted = data.sort(
    (a: CovidConfirmedDetail, b: CovidConfirmedDetail) =>
      getUnixTimestamp(b.Date) - getUnixTimestamp(a.Date)
  );
  sorted.forEach((value: CovidConfirmedDetail) => {
    const li = document.createElement('li');
    li.setAttribute('class', 'list-item-b flex align-center');
    const span = document.createElement('span');
    span.textContent = value.Cases.toString();
    span.setAttribute('class', 'recovered');
    const p = document.createElement('p');
    p.textContent = new Date(value.Date).toLocaleDateString().slice(0, -1);
    li.appendChild(span);
    li.appendChild(p);
    recoveredList?.appendChild(li);
  });
}

function clearRecoveredList() {
  recoveredList.innerHTML = '';
}

function setTotalRecoveredByCountry(data: CountrySumarryResponse) {
  recoveredTotal.innerText = data[0].Cases.toString();
}

function startLoadingAnimation() {
  deathsList.appendChild(deathSpinner);
  recoveredList.appendChild(recoveredSpinner);
}

function endLoadingAnimation() {
  deathsList.removeChild(deathSpinner);
  recoveredList.removeChild(recoveredSpinner);
}

async function setupData() {
  const { data } = await fetchCovidSummary();
  if (data.Countries !== undefined) {
    setTotalConfirmedNumber(data);
    setTotalDeathsByWorld(data);
    setTotalRecoveredByWorld(data);
    setCountryRanksByConfirmedCases(data);
    setLastUpdatedTimestamp(data);
  } else {
    const paragraph = createParagraphElement(
      'catching-in-progress',
      data.Message
    );
    deathsList.appendChild(paragraph);
  }
}

function renderChart(data: number[], labels: string[]) {
  const ctx = lineChart.getContext('2d');
  Chart.defaults.color = '#f5eaea';
  Chart.defaults.font.family = 'Exo 2';

  if (casesChart !== undefined) casesChart.destroy();
  if (ctx !== null) {
    casesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Confirmed for the last two weeks',
            backgroundColor: '#feb72b',
            borderColor: '#feb72b',
            data,
          },
        ],
      },
      options: {},
    });
  }
}

function setChartData(data: CountrySumarryResponse) {
  const chartData = data
    .slice(-14)
    .map((value: CovidConfirmedDetail) => value.Cases);
  const chartLabel = data
    .slice(-14)
    .map((value: CovidConfirmedDetail) =>
      new Date(value.Date).toLocaleDateString().slice(5, -1)
    );
  renderChart(chartData, chartLabel);
}

function setTotalConfirmedNumber(data: CovidSummaryResponse) {
  confirmedTotal.innerText = data.Countries.reduce(
    (total: number, current: Country) => (total += current.TotalConfirmed),
    0
  ).toString();
}

function setTotalDeathsByWorld(data: CovidSummaryResponse) {
  deathsTotal.innerText = data.Countries.reduce(
    (total: number, current: Country) => (total += current.TotalDeaths),
    0
  ).toString();
}

function setTotalRecoveredByWorld(data: CovidSummaryResponse) {
  recoveredTotal.innerText = data.Countries.reduce(
    (total: number, current: Country) => (total += current.TotalRecovered),
    0
  ).toString();
}

function setCountryRanksByConfirmedCases(data: CovidSummaryResponse) {
  const sorted = data.Countries.sort(
    (a: Country, b: Country) => b.TotalConfirmed - a.TotalConfirmed
  );
  sorted.forEach((value: Country) => {
    const li = document.createElement('li');
    li.setAttribute('class', 'list-item flex align-center');
    li.setAttribute('id', value.Slug);
    const span = document.createElement('span');
    span.textContent = value.TotalConfirmed.toString();
    span.setAttribute('class', 'cases');
    const p = document.createElement('p');
    p.setAttribute('class', 'country');
    p.textContent = value.Country;
    li.appendChild(span);
    li.appendChild(p);
    rankList.appendChild(li);
  });
}

function setLastUpdatedTimestamp(data: CovidSummaryResponse) {
  lastUpdatedTime.innerText = new Date(data.Date).toLocaleString();
}

startApp();
