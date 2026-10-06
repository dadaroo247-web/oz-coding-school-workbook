// ============================================================
//  calculator.js — 계산기 핵심 로직
//  📝 과제: 💡 표시된 빈칸을 채워 기능을 완성하세요.
// ============================================================

const mainDisplay = document.getElementById("mainDisplay");
const subDisplay = document.getElementById("subDisplay");

let expression = ""; // 현재 입력 중인 수식 문자열
let justCalculated = false; // 방금 = 을 눌렀는지 여부

// 디스플레이 갱신 — main.js에서도 호출합니다 (수정 금지)
export const updateDisplay = () => {
  mainDisplay.textContent = expression || "0";
  mainDisplay.style.fontSize = expression.length > 10 ? "1.8rem" : "2.6rem";
};

// ── 과제 1: 숫자 / 소수점 입력 ──────────────────────────────
export const appendNumber = (num) => {
  if (justCalculated) {
    expression = "";
  }

  if (num === ".") {
    const segments = expression.split(/[+\-*/]/);
    const currentSegment = segments[segments.length - 1];
    if (!currentSegment.includes(".")) {
      expression += currentSegment === "" ? "0." : ".";
    }
  } else if (expression === "0") {
    expression = num;
  } else {
    expression += num;
  }

  justCalculated = false;
  updateDisplay();
};

// ── 과제 2: 연산자 입력 ─────────────────────────────────────
export const appendOperator = (op) => {
  if (expression === "") return;

  const lastChar = expression[expression.length - 1];
  const isOperator = ["+", "-", "*", "/"].includes(lastChar);

  // justCalculated가 true여도 expression(이전 결과)을 그대로 두고 연산자만 붙이면
  // "이어서 계산" 조건이 자동으로 충족됩니다.
  if (isOperator) {
    expression = expression.slice(0, -1) + op;
  } else {
    expression += op;
  }

  justCalculated = false;
  updateDisplay();
};

// ── 과제 3: 계산 실행 ───────────────────────────────────────
export const calculate = () => {
  const lastChar = expression[expression.length - 1];
  if (expression === "" || ["+", "-", "*", "/"].includes(lastChar)) {
    return null;
  }

  let rawResult;
  try {
    rawResult = Function('"use strict"; return (' + expression + ")")();
  } catch (e) {
    subDisplay.textContent = "잘못된 수식입니다";
    return null;
  }

  // 0으로 나누기(또는 그 결과가 무한대/정의불가) 감지.
  // 단순히 /\/0/ 문자열 검사만 하면 "100/0.5" 같은 정상 계산까지
  // 오탐지하므로, 실제 계산 결과가 유한한 값인지로 판단합니다.
  if (!isFinite(rawResult)) {
    subDisplay.textContent = "0으로 나눌 수 없습니다";
    return null;
  }

  const result = parseFloat(rawResult.toFixed(10)).toString();
  const usedExpression = expression;

  mainDisplay.textContent = result;
  mainDisplay.style.fontSize = result.length > 10 ? "1.8rem" : "2.6rem";
  subDisplay.textContent = usedExpression + " =";
  justCalculated = true;
  expression = result;

  return { expression: usedExpression, result };
};

// ── 과제 4: 마지막 문자 삭제 ────────────────────────────────
export const deleteLast = () => {
  if (justCalculated) {
    clearAll();
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay();
};

// ── 도전 1: % 연산 (선택 과제) ──────────────────────────────
export const appendPercent = () => {
  if (expression === "") return;

  const lastChar = expression[expression.length - 1];
  if (["+", "-", "*", "/"].includes(lastChar)) return;

  const ops = ["+", "-", "*", "/"];
  let splitIndex = 0;
  for (let i = expression.length - 1; i >= 0; i--) {
    if (ops.includes(expression[i])) {
      splitIndex = i + 1;
      break;
    }
  }

  const prefix = expression.slice(0, splitIndex);
  const numStr = expression.slice(splitIndex);
  const percentVal = (parseFloat(numStr) / 100).toString();

  expression = prefix + percentVal;
  updateDisplay();
};

// ── 도전 3: 기록 클릭 시 결과 불러오기 (선택 과제) ──────────
export const setExpression = (value) => {
  expression = value;
  justCalculated = true;
  updateDisplay();
};

// ── 전체 초기화 (완성 코드 — 수정 금지) ─────────────────────
export const clearAll = () => {
  expression = "";
  justCalculated = false;
  mainDisplay.textContent = "0";
  mainDisplay.style.fontSize = "2.6rem";
  subDisplay.textContent = "";
  document
    .querySelectorAll(".btn-op")
    .forEach((b) => b.classList.remove("active"));
};
