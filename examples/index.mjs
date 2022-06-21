import Printer from "#Printer";

const pt = new Printer();

console.log(pt);

pt.text(0, 0, "ABC测试一下", 2)
.text(16 * 11, 0, "ABC测试一下", 2)
.feed(80)
.print();