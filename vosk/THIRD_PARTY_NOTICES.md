# Third-party components

- Vosk-browser 0.0.8: https://github.com/ccoreilly/vosk-browser (Apache-2.0).
- Vosk API: https://github.com/alphacep/vosk-api (Apache-2.0).
- Japanese model vosk-model-small-ja-0.22: https://alphacephei.com/vosk/models (Apache-2.0).

The Japanese model is repackaged from ZIP to TAR.GZ with conf/model.conf adjusted for faster decoding and shorter silence endpoints. Acoustic and language model weights are unchanged.
Runtime and model files are downloaded and verified by scripts/prepare-vosk.py.
License: https://www.apache.org/licenses/LICENSE-2.0

