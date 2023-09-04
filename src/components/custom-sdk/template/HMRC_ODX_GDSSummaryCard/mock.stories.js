export const pyReviewRaw = {
    name: 'CollectInformation',
    type: 'View',
    config: {
      template: 'DefaultForm',
      ruleClass: 'OM5W9U-SampleApp-Work-Test',
      localeReference: '@LR OM5W9U-SAMPLEAPP-WORK-TEST!VIEW!COLLECTINFORMATION',
      context: '@P .pyViewContext'
    },
    children: [
      {
        name: 'A',
        type: 'Region',
        children: [
          {
            type: 'TextInput',
            config: {
              value: 'Joe',
              label: '@L First Name'
            }
          },
          {
            type: 'TextInput',
            config: {
              value: '01/01/2023',
              label: '@L Date of Birth'
            }
          },
        
        
        ]
      },
     
    ],
    classID: 'OM5W9U-SampleApp-Work-Test'
  };

  export const regionChildrenResolved = [
    {
      readOnly: undefined,
      value: 'John',
      label: 'First Name',
      hasSuggestions: false
    },
  
    {
      readOnly: undefined,
      value: '2023-01-25',
      label: 'Date of Birth',
      hasSuggestions: false
    }

  ];
