const fs = require(\ fs\);
const path = require(\path\);
const base = \C:/Users/user/malvo\;
const mk = d => fs.mkdirSync(path.join(base,d),{recursive:true});
const wr = (f,c) => { fs.writeFileSync(path.join(base,f),c,\utf8\); console.log(\wrote:\,f); };
