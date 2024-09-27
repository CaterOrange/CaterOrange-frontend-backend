module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        devtool: 'none'
      }
    ]
  }    