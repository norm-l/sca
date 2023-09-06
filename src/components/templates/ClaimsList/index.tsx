import React, {useEffect, useState} from 'react';
import DateFormatter from '@pega/react-sdk-components/lib/components/helpers/formatters/Date';
import Button from '../../../components/BaseComponents/Button/Button';
import PropTypes from "prop-types";
import { Utils } from '../../helpers/utils';
import { useTranslation } from 'react-i18next';

declare const PCore: any;

export default function ClaimsList(props){
  const { thePConn, data, title, rowClickAction, buttonContent} = props;
  const { t } = useTranslation();
  const [claims, setClaims] = useState([]);

  const statusMapping = (status) => {
    switch(status){
      case 'Open-InProgress':
        return { text: t('IN_PROGRESS'), tagColour: 'blue' };
      case 'Pending-CBS':
      case 'Resolved-Completed':
      case 'Pending-ManualInvestigation':
        return {text: t('CLAIM_RECEIVED'), tagColour:'purple'};
      default:
        return {text:status, tagColour:'grey'};
    }
  }

  function _rowClick(row: any) {
    const {pzInsKey, pyAssignmentID} = row;

    const container = thePConn.getContainerName();
    const target = `${PCore.getConstants().APP.APP}/${container}`;

    if( rowClickAction === 'OpenAssignment'){
      const openAssignmentOptions = { containerName: container};
      PCore.getMashupApi().openAssignment(pyAssignmentID, target, openAssignmentOptions)
      .then(()=>{
        Utils.scrollToTop();
      });
    } else if ( rowClickAction === 'OpenCase'){
      PCore.getMashupApi().openCase(pzInsKey, target, {pageName:'SummaryClaim'})
      .then(()=>{
        Utils.scrollToTop();
      });
    }
  }

  function extractChildren(childrenJSON : string) {
    return JSON.parse(childrenJSON.slice(childrenJSON.indexOf(':') + 1));
  }

  function getClaims() {
    const claimsData = [];
    data.forEach(item => {
      const claimItem = {
        claimRef : item.pyID,
        dateCreated : DateFormatter.Date(item.pxCreateDateTime, { format: 'DD MMMM YYYY' }),
        children : [],
        actionButton :
          (<Button
              attributes={{className:'govuk-!-margin-top-4 govuk-!-margin-bottom-4'}}
              variant='secondary'
              onClick={() => {
                _rowClick(item);
              }}
            >
              {buttonContent}
            </Button>),
        status : statusMapping(item.pyStatusWork)
      };
      if(item.Claim.ChildrenJSON){
        const additionalChildren = extractChildren(item.Claim.ChildrenJSON);
        additionalChildren.forEach(child =>{
          const newChild = {
            firstName : child.name,
            lastName : item.Claim.Child.pyLastName,
            dob : DateFormatter.Date(child.dob, { format: 'DD MMMM YYYY' })
          }
          claimItem.children.push(newChild);
        })
      }else{
        claimItem.children.push({
          firstName : item.Claim.Child.pyFirstName,
          lastName : item.Claim.Child.pyLastName,
          dob : DateFormatter.Date(item.Claim.Child.DateOfBirth, { format: 'DD MMMM YYYY' })
        });
      }
      claimsData.push(claimItem);
    })
    return claimsData;
  }

  useEffect(() => {
    setClaims([...getClaims()]);
  },[data])

  return (
    <>
      {claims.length !== 0 && <h2 className='govuk-heading-m'>{title}</h2>}
      {claims.length > 1 && <h3 className='govuk-heading-s'>{t('CHILDREN_ADDED')}</h3>}
      {claims.map(claimItem =>
        <dl className='govuk-summary-list' key={claimItem.claimRef}>
          <div className='govuk-summary-list__row'>
            <dt className='govuk-summary-list__key'>
              {claimItem.children.map(child =>
                <p key={child.firstName}>{`${child.firstName} ${child.lastName}`}<br/>
                <span className='govuk-!-font-weight-regular'>{t('DATE_OF_BIRTH')}</span><br/>
                <span className='govuk-!-font-weight-regular'>{child.dob}</span><br/>
                <span className='govuk-!-font-weight-regular'>{t('CREATED_DATE')}</span><br/>
                <span className='govuk-!-font-weight-regular'>{claimItem.dateCreated}</span>
                </p>
              )}
              {claimItem.actionButton}
            </dt>
            <dd className='govuk-summary-list__actions govuk-!-width-one-half'>
              <a href='#' className='govuk-link'>
                <strong className={`govuk-tag govuk-tag--${claimItem.status.tagColour}`}>{claimItem.status.text}</strong>
              </a>
            </dd>
          </div>
        </dl>
      )}
    </>
  )
}

ClaimsList.propTypes = {
  thePConn: PropTypes.object,
  data: PropTypes.array,
  title: PropTypes.string,
  rowClickAction: PropTypes.oneOf(["OpenCase","OpenAssignment"]),
  buttonContent: PropTypes.string
}
