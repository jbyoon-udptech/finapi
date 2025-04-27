import { expect } from "chai"
//import { sum } from "./sum"

function sum(a: number, b: number): number {
  return a + b
}

describe("sum function", () => {
  it("should return 3 when adding 1 and 2", () => {
    expect(sum(1, 2)).to.equal(3)
  })
})
