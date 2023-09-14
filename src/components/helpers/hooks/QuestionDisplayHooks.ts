import {useContext} from 'react';
import { HMRCAppContext } from '../../override-sdk/infra/Assignment/Assignment';
/**
 * Helper hook for handling instances where there is only one field presented in the current view.
 * Returns a boolean indicating whether or not there is only one field to display in the current context
*/

/* Retaining this code for future change in implementation of single question pages. */


export default function useIsOnlyField(effectTrigger = null){
    const { singleQuestionPage } = useContext(HMRCAppContext);
    return singleQuestionPage;
}
