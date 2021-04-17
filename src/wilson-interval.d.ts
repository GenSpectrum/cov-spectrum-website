declare module 'wilson-interval' {
  interface Options {
    confidence: number;
    precision: number;
  }

  interface Result {
    high: string;
    center: string;
    low: string;
  }

  export default function wilson(
    observed: number,
    sample: number,
    population?: number | false,
    options?: Partial<Options>
  ): Result;
}
