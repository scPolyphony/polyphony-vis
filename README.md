# polyphony-vis

This repository contains the frontend implementation for [Polyphony](https://github.com/ChengFR/polyphony), our interactive transfer-learning framework for reference-based single-cell data analysis.

__polyphony-vis__ is implemented using the [Vitessce](http://vitessce.io) framework and its [plugin APIs](http://vitessce.io/docs/dev-plugins).


## Run [polyphony](https://github.com/ChengFR/polyphony) (backend)

In the root of the `polyphony` repository, run:

```sh
polyphony --experiment case-1 --save --load_exist --port 7778
```

## Run polyphony-vis (frontend)

In this repository, run:

```sh
npm run start
```


## Notes

__polyphony-vis__ was originally implemented as a fork of the Vitessce repository at https://github.com/ChengFR/vitessce/tree/figure-making (see https://github.com/vitessce/vitessce/compare/master...ChengFR:figure-making) before refactoring into the plugin implementation here.