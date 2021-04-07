const pdtPlugins = [];
// 去除console.log
if (process.env.NODE_ENV === "production") pdtPlugins.push("transform-remove-console");
module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  plugins: [...pdtPlugins],
};
