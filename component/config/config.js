export const colors = {
    primary: '#0f7538',
    success: '#28a745',
    error: '#dc3545',
    textLight: '#ffffff',
    textDark: '#333333',
    background: 'white',
    header: '#2b6c45',
    data: '#6ea762',
    divider: '#9d9c1e',
    filter:'#f5fff3',
    icon: '#be7909',
    card:'#ffffff',
    button: '#538847'
  };

export const toastConfig = {
    success: {
      type: 'success',
      position: 'top',
      text1Style: {
        color: '#366b36',
      },
      visibilityTime: 1000,
      autoHide: true,
      topOffset: 30,
      textStyle: {
        numberOfLines: 2,
      },
      style: {
        backgroundColor: colors.success,
      },
    },
    error: {
      type: 'error',
      position: 'top',
      text1Style: {
        color: 'red',
      },
      visibilityTime: 1000,
      autoHide: true,
      topOffset: 30,
      textStyle: {
        numberOfLines: 2,
      },
      style: {
        backgroundColor: colors.error,
      },
    },
  };
