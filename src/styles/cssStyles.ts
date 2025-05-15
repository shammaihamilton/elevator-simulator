

export const metal = {
  base: {
    position: "relative",
    margin: "5px auto",
    outline: "none",
    font: 'bold 4em "Helvetica Neue", Arial, Helvetica, Geneva, sans-serif',
    textAlign: "center",
    color: "hsla(0,0%,20%,1)",
    textShadow: "hsla(0,0%,40%,.5) 0 -1px 0, hsla(0,0%,100%,.6) 0 2px 1px",
    backgroundColor: "hsl(0,0%,90%)",
    boxShadow: `
      inset hsla(0,0%,15%, 1) 0 0px 0px 4px,
      inset hsla(0,0%,15%, .8) 0 -1px 5px 4px,
      inset hsla(0,0%,0%, .25) 0 -1px 0px 7px,
      inset hsla(0,0%,100%,.7) 0 2px 1px 7px,
      hsla(0,0%, 0%,.0) 0 -5px 6px 4px,
      hsla(0,0%,100%,.0) 0 5px 6px 4px
    `,
    transition: "color .2s",
  },
  
  radial: {
    width: "160px",
    height: "160px",
    lineHeight: "160px",
    borderRadius: "80px",
    backgroundImage: `
      radial-gradient(50% 0%, 8% 50%, hsla(0,0%,100%,.5) 0%, hsla(0,0%,100%,0) 100%),
      radial-gradient(50% 100%, 12% 50%, hsla(0,0%,100%,.6) 0%, hsla(0,0%,100%,0) 100%),
      radial-gradient(0% 50%, 50% 7%, hsla(0,0%,100%,.5) 0%, hsla(0,0%,100%,0) 100%),
      radial-gradient(100% 50%, 50% 5%, hsla(0,0%,100%,.5) 0%, hsla(0,0%,100%,0) 100%),
      repeating-radial-gradient(50% 50%, 100% 100%, hsla(0,0%, 0%,0) 0%, hsla(0,0%, 0%,0) 3%, hsla(0,0%, 0%,.1) 3.5%),
      repeating-radial-gradient(50% 50%, 100% 100%, hsla(0,0%,100%,0) 0%, hsla(0,0%,100%,0) 6%, hsla(0,0%,100%,.1) 7.5%),
      repeating-radial-gradient(50% 50%, 100% 100%, hsla(0,0%,100%,0) 0%, hsla(0,0%,100%,0) 1.2%, hsla(0,0%,100%,.2) 2.2%),
      radial-gradient(50% 50%, 200% 50%, hsla(0,0%,90%,1) 5%, hsla(0,0%,85%,1) 30%, hsla(0,0%,60%,1) 100%)
    `,
    position: "relative",
    margin: "5px auto",
    outline: "none",
    font: 'bold 4em "Helvetica Neue", Arial, Helvetica, Geneva, sans-serif',
    textAlign: "center",
    color: "hsla(0,0%,20%,1)",
    textShadow: "hsla(0,0%,40%,.5) 0 -1px 0, hsla(0,0%,100%,.6) 0 2px 1px",
    backgroundColor: "hsl(0,0%,90%)",
    boxShadow: `
      inset hsla(0,0%,15%, 1) 0 0px 0px 4px,
      inset hsla(0,0%,15%, .8) 0 -1px 5px 4px,
      inset hsla(0,0%,0%, .25) 0 -1px 0px 7px,
      inset hsla(0,0%,100%,.7) 0 2px 1px 7px,
      hsla(0,0%, 0%,.0) 0 -5px 6px 4px,
      hsla(0,0%,100%,.0) 0 5px 6px 4px
    `,
    transition: "color .2s",
  },
  
  linear: {
    width: "100px",
    fontSize: "4em",
    height: "80px",
    borderRadius: ".5em",
    backgroundImage: `
      repeating-linear-gradient(left, hsla(0,0%,100%,0) 0%, hsla(0,0%,100%,0) 6%, hsla(0,0%,100%, .1) 7.5%),
      repeating-linear-gradient(left, hsla(0,0%, 0%,0) 0%, hsla(0,0%, 0%,0) 4%, hsla(0,0%, 0%,.03) 4.5%),
      repeating-linear-gradient(left, hsla(0,0%,100%,0) 0%, hsla(0,0%,100%,0) 1.2%, hsla(0,0%,100%,.15) 2.2%),
      linear-gradient(180deg, hsl(0,0%,78%) 0%, hsl(0,0%,90%) 47%, hsl(0,0%,78%) 53%, hsl(0,0%,70%)100%)
    `,
    position: "relative",
    margin: "5px auto",
    outline: "none",
    font: 'bold 4em "Helvetica Neue", Arial, Helvetica, Geneva, sans-serif',
    textAlign: "center",
    color: "hsla(0,0%,20%,1)",
    textShadow: "hsla(0,0%,40%,.5) 0 -1px 0, hsla(0,0%,100%,.6) 0 2px 1px",
    boxShadow: `
      inset hsla(0,0%,15%, 1) 0 0px 0px 4px,
      inset hsla(0,0%,15%, .8) 0 -1px 5px 4px,
      inset hsla(0,0%,0%, .25) 0 -1px 0px 7px,
      inset hsla(0,0%,100%,.7) 0 2px 1px 7px,
      hsla(0,0%, 0%,.0) 0 -5px 6px 4px,
      hsla(0,0%,100%,.0) 0 5px 6px 4px
    `,
    transition: "color .2s",
  },
  
  active: {
    color: "hsl(210, 100%, 40%)",
    textShadow: `
      hsla(210,100%,20%,.3) 0 -1px 0,
      hsl(210,100%,85%) 0 2px 1px,
      hsla(200,100%,80%,1) 0 0 5px,
      hsla(210,100%,50%,.6) 0 0 20px
    `,
    boxShadow: `
      inset hsla(210,100%,30%, 1) 0 0px 0px 4px,
      inset hsla(210,100%,15%, .4) 0 -1px 5px 4px,
      inset hsla(210,100%,20%,.25) 0 -1px 0px 7px,
      inset hsla(210,100%,100%,.7) 0 2px 1px 7px,
      hsla(210,100%,75%, .8) 0 0px 3px 2px,
      hsla(210,50%,40%, .0) 0 -5px 6px 4px,
      hsla(210,80%,95%, 0) 0 5px 6px 4px
    `,
  }
};

export const floor = {
  floor: {
    backgroundColor: "silver",
    backgroundImage: `
      linear-gradient(335deg, #b00 23px, transparent 23px),
      linear-gradient(155deg, #d00 23px, transparent 23px),
      linear-gradient(335deg, #b00 23px, transparent 23px),
      linear-gradient(155deg, #d00 23px, transparent 23px)
    `,
    backgroundSize: "58px 58px",
    backgroundPosition: "0px 2px, 4px 35px, 29px 31px, 34px 6px",
  }
};