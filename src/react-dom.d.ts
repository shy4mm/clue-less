declare module 'react-dom' {
  export function render(
    element: React.ReactElement | React.ReactNode,
    container: HTMLElement | SVGElement,
    callback?: () => void
  ): void
  
  export namespace ReactDOM {
    export function createRoot(
      container: HTMLElement | SVGElement
    ): ReactDOM.Root
    
    export namespace Root {
      export function render(
        element: React.ReactElement | React.ReactNode
      ): void
      export function unmount(): void
    }
  }
}