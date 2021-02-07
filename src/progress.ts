class Progress {
  size: any;
  cursor: number;
  timer: any;
  constructor(size: number) {
    this.size = size;
    this.cursor = 0;
    this.timer = null;
  }
  start() {
    console.log(`Getting keywords from ${this.size} videos`);
  }

  tick() {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    const percent = (((this.cursor + 1) / this.size) * 100).toFixed() + "%";

    process.stdout.write(percent);
    this.cursor++;
  }
}

export default Progress;
