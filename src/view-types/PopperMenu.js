import React, { useRef } from 'react';
import { makeStyles, createTheme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import IconButton from '@material-ui/core/IconButton';
import MenuList from '@material-ui/core/MenuList';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Fade from '@material-ui/core/Fade';

import { useVitessceContainer } from './hooks';

export const styles = makeStyles(() => ({
  paper: {
    maxHeight: 200,
    overflow: 'auto',
  },
  container: {
    position: 'relative',
    left: 0,
    top: 0,
  },
  span: {
    width: '70px',
    textAlign: 'center',
    paddingLeft: '2px',
    paddingRight: '2px',
  },
}));

export const muiTheme = {
  dark: createTheme({
    palette: {
      type: 'dark',
      primary: grey,
      secondary: grey,
      primaryBackground: '#222222',
      primaryBackgroundHighlight: '#000000',
      primaryBackgroundInput: '#D3D3D3',
      primaryBackgroundDim: '#333333',
      primaryBackgroundLight: '#757575',
      primaryForeground: '#D3D3D3',
      primaryForegroundDim: '#000000',
      primaryForegroundActive: '#9bb7d6',
      secondaryBackground: '#000000',
      secondaryBackgroundDim: '#444444',
      secondaryForeground: '#D3D3D3',
    },
    props: {
      MuiButtonBase: {
        disableRipple: true,
      },
    },
  }),
  light: createTheme({
    palette: {
      type: 'light',
      primary: grey,
      secondary: grey,
      primaryBackground: '#F1F1F1',
      primaryBackgroundHighlight: '#FFFFFF',
      primaryBackgroundInput: '#FFFFFF',
      primaryBackgroundDim: '#8A8A8A',
      primaryBackgroundLight: '#e0e0e0',
      primaryForeground: '#333333',
      primaryForegroundDim: '#808080',
      primaryForegroundActive: '#0074D9',
      secondaryBackground: '#F1F1F1',
      secondaryBackgroundDim: '#C0C0C0',
      secondaryForeground: '#222222',
    },
    props: {
      MuiButtonBase: {
        disableRipple: true,
      },
    },
  }),
};

export function PopperMenu(props) {
  const {
    buttonIcon,
    open,
    setOpen,
    children,
    buttonClassName,
    placement = 'bottom-end',
  } = props;
  const classes = styles();

  const anchorRef = useRef();

  const handleClick = () => {
    setOpen(prev => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const id = open ? 'v-popover-menu' : undefined;

  const getTooltipContainer = useVitessceContainer(anchorRef);

  return (
    <div ref={anchorRef} className={classes.container}>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        size="small"
        className={buttonClassName}
      >
        {buttonIcon}
      </IconButton>
      <Popper
        id={id}
        open={open}
        anchorEl={anchorRef && anchorRef.current}
        container={getTooltipContainer}
        onClose={handleClose}
        placement={placement}
        transition
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Fade {...TransitionProps} timeout={100}>
              <Paper elevation={4} className={classes.paper}>
                <MenuList>{children}</MenuList>
              </Paper>
            </Fade>
          </ClickAwayListener>
        )}
      </Popper>
    </div>
  );
}
