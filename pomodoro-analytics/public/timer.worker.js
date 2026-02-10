/* eslint-disable no-restricted-globals */
let intervalId = null;

self.onmessage = (e) => {
  const { command } = e.data;

  if (command === "START") {
    if (intervalId) clearInterval(intervalId);
    
    intervalId = setInterval(() => {
      self.postMessage({ type: "TICK" });
    }, 1000);
  } 
  else if (command === "STOP" || command === "PAUSE") {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};
