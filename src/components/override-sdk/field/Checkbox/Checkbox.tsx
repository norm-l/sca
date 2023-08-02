import React, {useState} from 'react';
import GDSCheckboxes from '../../../BaseComponents/Checkboxes/Checkboxes';
import useIsOnlyField from '../../../helpers/hooks/QuestionDisplayHooks'
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import ReadOnlyDisplay from '../../../BaseComponents/ReadOnlyDisplay/ReadOnlyDisplay';

export default function CheckboxComponent(props) {
  const {
    getPConnect,
    name,
    inputProps,
    validatemessage,
    hintText,
    label,
    readOnly,
    value,
    testId,
  } = props;

  const isOnlyField = useIsOnlyField();
  const[ErrorMessage] = useState(validatemessage)

  const thePConn = getPConnect();
  const theConfigProps = thePConn.getConfigProps();
  const { caption } = theConfigProps;
  const actionsApi = thePConn.getActionsApi();
  const propName = thePConn.getStateProps().value;

  if(readOnly){
      return (<ReadOnlyDisplay value={value?props.trueLabel:props.falseLabel} label={caption}/>)
  }

  const handleChange = event => {
    handleEvent(actionsApi, 'changeNblur', propName, event.target.checked);
  };

  const optionsList = [{checked: value, label: caption, hintText: " ", readOnly:false, name, onChange:handleChange}]

  const extraProps= {testProps:{'data-test-id':testId}};

  return (
    <>
      <GDSCheckboxes
        inputProps={...inputProps}
        name={name}
        label={label}
        optionsList={optionsList}
        legendIsHeading={isOnlyField}
        errorText={ErrorMessage}
        hintText={hintText}
        onChange={handleChange}
        {...extraProps}
      />
    </>
  );
}
