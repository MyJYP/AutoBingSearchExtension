// tests/keyword-combiner.test.js

describe("Keyword Combiner", () => {
  test("기본 키워드와 관련 키워드를 조합한다", () => {
    const main = "Python";
    const related = ["튜토리얼", "가이드"];
    const result = combineKeywords(main, related);

    expect(result).toContain("Python 튜토리얼");
    expect(result).toContain("튜토리얼 Python");
    expect(result.length).toBe(4);
  });

  test("중복 키워드를 제거한다", () => {
    const main = "Python";
    const related = ["튜토리얼", "튜토리얼"];
    const result = combineKeywords(main, related);

    expect(result.length).toBe(2); // 중복 제거됨
  });
});
