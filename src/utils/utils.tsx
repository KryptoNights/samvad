export function debounce(fn:any) {
    let timeout:any;
    return function (...args:any) {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        fn(...args);
      }, 300);
    };
  }
  