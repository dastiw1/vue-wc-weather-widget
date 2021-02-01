module.exports = {
  publicPath: '/',
  transpileDependencies: ['vuetify'],
  chainWebpack: (config) => {
    config.plugin('VuetifyLoaderPlugin').tap(() => [
      {
        match(_, { kebabTag, camelTag }) {
          if (kebabTag.startsWith('core-')) {
            return [camelTag, `import ${camelTag} from '@/components/core/${camelTag.substring(4)}.vue'`];
          }
        },
      },
    ]);
  },
};
