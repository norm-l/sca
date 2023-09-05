import { useState } from 'react';
import HmrcOdxGdsSummaryCard from './index.tsx';
import { pyReviewRaw } from './mock.stories';
import { TextField } from '@material-ui/core';
import MuiPhoneNumber from 'material-ui-phone-number';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DayjsUtils from '@date-io/dayjs';

export default {
  title: 'HmrcOdxGdsSummaryCard',
  component: HmrcOdxGdsSummaryCard
};
const renderField = resolvedProps => {
  const { displayMode, value = '', label = '', onChange} = resolvedProps;

  const variant = displayMode === 'LABELS_LEFT' ? 'inline' : 'stacked';
  let val = '';
  if (label === 'Service Date')
    val = <MuiPickersUtilsProvider utils={DayjsUtils}><KeyboardDatePicker
      variant='inline'
      inputVariant='outlined'
      placeholder='mm/dd/yyyy'
      fullWidth
      format='MM/DD/YYYY'
      mask='__/__/____'
      size='small'
      label={label}
      value={value || null}
      onChange={onChange}
    />
    </MuiPickersUtilsProvider>


 
  if (label === 'First Name' || label ==='Date Of Birth')
  {
    val = <TextField value={value} size='small' variant='outlined' style={{ fontSize: '14px' }} label={label} onChange={onChange}></TextField>;
  }

  if (variant === 'inline') {
    val = value || <span aria-hidden='true'>&ndash;&ndash;</span>;
  }

  return val;
};
 
export const BaseHmrcOdxGdsSummaryCard = () => {
  const [firstName, setFirstName] = useState('John');

  const [dateOfBirth, setBirthDate] = useState('2023-01-25');

  const regionChildrenResolved = [
    {
      readOnly: undefined,
      value: firstName,
      label: 'First Name',
      hasSuggestions: false,
      onChange: val => {
        setFirstName(val.target.value);
      }
    },
 
 
     {
      readOnly: undefined,
      value: dateOfBirth,
      label: 'Date Of Birth',
      hasSuggestions: false,
      onChange: date => {
        const changeValue = date && date.isValid() ? date.toISOString() : null;
        setBirthDate(changeValue);
      }

    }
  ];
  const props = {
    template: 'DefaultForm',
    useType: "1",
    getPConnect: () => {
      return {
        getChildren: () => {
          return pyReviewRaw.children;
        },
       
        getRawMetadata: () => {
          return pyReviewRaw;
        },
        getInheritedProps: () => {
          return pyReviewRaw.config.inheritedProps;
        },
        setInheritedProp: () => {
          /* nothing */
        },
        resolveConfigProps: () => {
          /* nothing */
        },
        createComponent: config => {
          switch (config.config.value) {
            case '@P .FirstName':
              return renderField(regionChildrenResolved[0]);
           
           
            case '@P .DateOfBirth':
              return renderField(regionChildrenResolved[1]);
            
            default:
              break;
          }
        }
      };
    }
  };


  const regionAChildren = pyReviewRaw.children[0].children.map(child => {
    return props.getPConnect().createComponent(child);
  });


  return (
    <>
      <HmrcOdxGdsSummaryCard {...props}>
         {regionAChildren} 
      
      </HmrcOdxGdsSummaryCard>
    </>
  );
};
