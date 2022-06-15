import React, { useState } from 'react';
import {
  TouchableOpacity,
  Image as RNImage,
  StyleSheet,
  ViewPropTypes,
} from 'react-native';
import {
  downloadFile,
  exists,
  mkdir,
  TemporaryDirectoryPath,
} from 'react-native-fs';
import PhotoEditor from '@baronha/react-native-photo-editor';
import PropTypes from 'prop-types';

import { stickers } from '../assets/data';

const Image = (props) => {
  const { url, style: imageStyle } = props;
  const [path, setPath] = useState(url);

  async function downloadRemoteFile(remotePath) {
    const tempPath =
      TemporaryDirectoryPath +
      remotePath
        .split('/')
        ?.pop()
        ?.match('^[^?]+')
        ?.pop();
  
    try {
      const hasTmpdir = await exists(TemporaryDirectoryPath);
      if (!hasTmpdir) {
        await mkdir(TemporaryDirectoryPath);
      }
  
      const res = await downloadFile({
        fromUrl: remotePath,
        toFile: tempPath,
      }).promise;
  
      // Success
      if (res.statusCode === 200) {
        return tempPath;
      }
  
      throw new Error();
    } catch (err) {
      console.error(err.code);
      throw err;
    }
  }

  const edit = async (fileUrl) => {
    try {
      const result = await PhotoEditor.open({
        path: fileUrl,
        stickers,
      });
      console.log('resultEdit: ', result);
      setPath(result);
    } catch (e) {
      console.log('error', e);
    } finally {
      console.log('finally');
    }
  }
  const onPress = async () => {
    edit(path);
  };

  onLongPress = async () => {
    const localPath = await downloadRemoteFile(path);
    edit(`file://${localPath}`);
  }

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} onLongPress={onLongPress} style={imageStyle}>
      <RNImage {...props} source={{ uri: path }} style={style.image} />
    </TouchableOpacity>
  );
};

export default Image;

Image.propTypes = {
  url: PropTypes.string,
  style: ViewPropTypes.style,
};

const style = StyleSheet.create({
  image: {
    ...StyleSheet.absoluteFill,
  },
});
