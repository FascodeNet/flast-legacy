import { createMuiTheme, withStyles } from '@material-ui/core/styles';

export const lightTheme = createMuiTheme({
    typography: {
        fontFamily: '"Noto Sans", "Noto Sans JP", "sans-serif"'
    },
    palette: {
        type: 'light'
    }
});

export const darkTheme = createMuiTheme({
    typography: {
        fontFamily: '"Noto Sans", "Noto Sans JP", "sans-serif"'
    },
    palette: {
        type: 'dark'
    }
});

export const isDarkTheme = () => {
    return window.getThemeType();
}

export const getTheme = () => {
    return window.getThemeType() ? darkTheme : lightTheme;
}