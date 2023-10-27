import React from 'react';
import GDSCheckbox from '../../../BaseComponents/Checkboxes/Checkbox';
// import useIsOnlyField from '../../../helpers/hooks/QuestionDisplayHooks'
import handleEvent from '@pega/react-sdk-components/lib/components/helpers/event-utils';
import ReadOnlyDisplay from '../../../BaseComponents/ReadOnlyDisplay/ReadOnlyDisplay';

export default function CheckboxComponent(props) {
  const {
    getPConnect,
    inputProps,
    // validatemessage,
    hintText,
    readOnly,
    value
  } = props;
  
  // let label = props.label;

  // These two properties should be passed to individual checkbox components via pconnet registerAdditionalProps
  // exclusiveOption should be boolean indicating if this checkbox is and exclusive option, and will render the 'or'
  // div above it if it is.
  // exclusiveOptionChangeHandler will always be called in the onChange event, and so each checkbox should be passed a
  // relevant handler (mainly - non-exclusive checkboxes should have a handler that clears the exclusive option ,
  // and exclusive option will need a different handler to clear all other items )
  const {exclusiveOption, exclusiveOptionChangeHandler = () => {}, index} = getPConnect().getConfigProps();
  
  /* retaining for future reference, incase changes need to be reverted
  const {isOnlyField, overrideLabel} = useIsOnlyField(props.displayOrder);
  if(isOnlyField && !readOnly) label = overrideLabel.trim() ? overrideLabel : label; */
  
  /* const[errorMessage,setErrorMessage] = useState(validatemessage);
  useEffect(()=>{
    if(validatemessage){
    setErrorMessage(validatemessage)
    }
  },[validatemessage]) */
  
  // build name for id, allows for error message navigation to field
  const propertyContext = getPConnect().options.pageReference ? getPConnect().options.pageReference.split('.').pop() : '';
  const propertyName = getPConnect().getStateProps().value.split('.').pop()
  const name = `${propertyContext}-${propertyName}`;
  

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

  return (
    <>    
      {exclusiveOption && <div className="govuk-checkboxes__divider">or</div>}
      <GDSCheckbox
        item={{checked: value, label: caption, readOnly:false, hintText}}
        index={index}
        name={name}
        inputProps={...inputProps}
        onChange={(evt) => {
          handleChange(evt)
          exclusiveOptionChangeHandler();                
        }}
        key={name}
            />
    </>
  );
}
