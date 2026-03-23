declare module 'termynal' {
  interface TermynalOptions {
    startDelay?: number
    typeDelay?: number
    lineDelay?: number
  }

  interface TermynalLineData {
    type?: string
    value?: string
    prompt?: string
    delay?: number
    [key: string]: unknown
  }

  class Termynal {
    constructor(
      container: HTMLElement,
      options?: TermynalOptions,
      lineData?: TermynalLineData[],
    )
    init(): void
  }

  export default Termynal
}
