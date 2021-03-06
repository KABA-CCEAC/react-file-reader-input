import React from 'react';
import ReactDOM from 'react-dom';


export default class FileInput extends React.Component {
  static propTypes = {
    as: React.PropTypes.oneOf(['binary', 'buffer', 'text', 'url']),
    children: React.PropTypes.any,
    onChange: React.PropTypes.func,
  }
  constructor(props) {
    // FileReader compatibility warning.
    super(props);

    const win = typeof window === 'object' ? window : {};
    if ((typeof window === 'object') && (!win.File || !win.FileReader || !win.FileList || !win.Blob)) {
      console.warn(
        '[react-file-reader-input] Some file APIs detected as not supported.' +
        ' File reader functionality may not fully work.'
      );
    }
  }
  handleChange = e => {
    const initialEvent = Object.assign({}, e);
    const files = [];
    for (let i = 0; i < e.target.files.length; i++) {
      // Convert to Array.
      files.push(e.target.files[i]);
    }

    // Build Promise List, each promise resolved by FileReader.onload.
    Promise.all(files.map(file => new Promise((resolve, reject) => {
      let reader = new FileReader();

      reader.onload = result => {
        // Resolve both the FileReader result and its original file.
        resolve([result, file]);
      };

      // Read the file with format based on this.props.as.
      switch ((this.props.as || 'url').toLowerCase()) {
        case 'binary': {
          reader.readAsBinaryString(file);
          break;
        }
        case 'buffer': {
          reader.readAsArrayBuffer(file);
          break;
        }
        case 'text': {
          reader.readAsText(file);
          break;
        }
        case 'url': {
          reader.readAsDataURL(file);
          break;
        }
      }
    })))
    .then(zippedResults => {
      // Run the callback after all files have been read.
      this.props.onChange(initialEvent, zippedResults);
    });
  }
  triggerInput = e => {
    ReactDOM.findDOMNode(this._reactFileReaderInput).click();
  }
  render() {
    const hiddenInputStyle = this.props.children ? {
      // If user passes in children, display children and hide input.
      position: 'absolute',
      top: '-9999px'
    } : {};

    return <div className="_react-file-reader-input"
                onClick={this.triggerInput}>
      <input {...this.props} children={undefined} type="file"
             onChange={this.handleChange} ref={c => this._reactFileReaderInput = c}
             style={hiddenInputStyle}/>

      {this.props.children}
    </div>
  }
}
