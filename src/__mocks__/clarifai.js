const mockPredict = jest.fn(() => Promise.resolve({
  outputs: [{
    data: {
      regions: [{
        region_info: {
          bounding_box: {
            top_row: 0.1,
            left_col: 0.2,
            right_col: 0.3,
            bottom_row: 0.4
          }
        }
      }]
    }
  }]
}));

const clarifai = {
  App: jest.fn(() => ({
    models: {
      predict: mockPredict
    }
  })),
  FACE_DETECT_MODEL: 'face-detect-model'
};

clarifai.mockPredict = mockPredict;

module.exports = clarifai;
