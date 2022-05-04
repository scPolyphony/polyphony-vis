/* eslint-disable */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Navigation from '@material-ui/icons/Navigation';
import Add from '@material-ui/icons/Add';
import Edit from '@material-ui/icons/Edit';
import Update from '@material-ui/icons/Update';


const useStyles = makeStyles((theme) => ({
  tabRoot: {
    color: 'rgba(0, 0, 0, 0.54)',
    padding: '4px 0',
    fontSize: '14px',
    fontWeight: 400,
    minWidth: '0 !important',
    '& svg': {
      width: '18px',
      height: '18px',
    }
  },
  tabSelected: {
    color: '#1976d2',
  },
  tabLabelIcon: {
    minHeight: 0,
    '& :first-child': {
      marginBottom: '0 !important',
      marginRight: '4px !important',
    }
  },
  tabWrapper: {
    height: '32px',
    flexDirection: 'row',
  },
  tabsRoot: {
    minHeight: '0px',
    height: '100%',
  },
  tabsFlexContainer: {
    height: '100%',
  },
  tabsIndicator: {
    backgroundColor: '#1976d2',
  },
  circularProgressRoot: {
    color: '#1976d2',
  },
  circularProgressText: {
    fontSize: '12px !important',
    lineHeight: '12px !important',
    marginTop: '-3px'
  },
  circularProgressTextBox: {
    height: '43px',
  },
  updateButtonRoot: {
    color: '#fff',
    backgroundColor: '#1976d2',
    '&:hover': {
      backgroundColor: '#115293',
    },
  },
}));

function CircularProgressWithLabel(props) {
  const classes = useStyles();
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" {...props} classes={{ root: classes.circularProgressRoot }} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
        classes={{ root: classes.circularProgressTextBox }}
      >
        <Typography classes={{ root: classes.circularProgressText }} variant="caption" component="div" color="textSecondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function QRStatus(props) {
  const {
    warn,

    numAnchorSetsConfirmed,
    numAnchorSetsTotal,
    numQueryCellsConfirmed,
    numQueryCellsTotal,

    onUpdateModel,
    modelStatus,

    anchorEditTool,
    setAnchorEditTool,

    anchorEditMode,
    setAnchorEditMode,
    clearAnchorSetFocus,
  } = props;
  const classes = useStyles();

  const value = (anchorEditTool === null ? 0 : (anchorEditMode === null ? 1 : 2));
  const progress = numQueryCellsTotal === null ? 0 : 100 * (numQueryCellsConfirmed / numQueryCellsTotal);

  const valueToInstructions = [
    '',
    'You are currently adding an anchor set. Use the lasso tool in the Comparison View to select cells.',
    `You are currently editing anchor set ${anchorEditMode?.anchorId}. Use the lasso tool in the Comparison View to select cells.`,
  ];

  const messages = [];
  if (warn) {
    messages.push(<p className="alert alert-warning my-0 details" key="warn">{warn}</p>);
  }
  
  const handleChange = (event, newValue) => {
    if(newValue === 0) {
      clearAnchorSetFocus();
      setAnchorEditTool(null);
      setAnchorEditMode(null);
    }
    if(newValue === 1) {
      clearAnchorSetFocus();
      setAnchorEditTool('lasso');
      setAnchorEditMode(null);
    }
  };

  const tabClasses = { root: classes.tabRoot, selected: classes.tabSelected, labelIcon: classes.tabLabelIcon, wrapper: classes.tabWrapper };


  return (
    <div className="qrStatus">
      {/*<div className="qrStatusCompletion">
        <CircularProgressWithLabel value={progress} />
        <Box position="relative" display="inline-flex">
          <span className="qrStatusCompletionInfo">
            {numQueryCellsTotal === null ? (<span>Loading data...</span>) : (
              <span>You have confirmed {numAnchorSetsConfirmed} of {numAnchorSetsTotal} anchor sets, comprising {numQueryCellsConfirmed} of {numQueryCellsTotal} query cells.</span>
            )}
          </span>
        </Box>
      </div>*/}
      <div className="systemTitle">
        <span>Polyphony</span>
      </div>
      <div className="qrStatusMode">
        <Tabs
          variant="fullWidth"
          value={value}
          onChange={handleChange}
          classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator, flexContainer: classes.tabsFlexContainer }}
        >
          <Tab label="Explore" fullWidth icon={<Navigation />} classes={tabClasses} />
          <Tab label="Add" fullWidth icon={<Add />} classes={tabClasses} />
          <Tab label="Edit" fullWidth icon={<Edit />} disabled classes={tabClasses} title="To edit an anchor set, click the three-dot menu next to a set of interest in the Cell Sets view."/>
        </Tabs>
      </div>
      <div className="qrStatusInstructions">
        {valueToInstructions[value]}
      </div>
      <div className="qrStatusModel">
        {modelStatus === 'loading' ? (
          <CircularProgress
            classes={{ root: classes.circularProgressRoot }}
          />
        ) : (
          <Button
            onClick={onUpdateModel}
            size="small"
            classes={{ root: classes.updateButtonRoot }}
            variant="contained"
            startIcon={<Update />}
            disableElevation
          >
            Update Model
          </Button>
        )}
      </div>
    </div>
  );
}
