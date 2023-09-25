// @ts-nocheck - TypeScript type checking to be added soon
import React, { useState, useEffect } from 'react';
import { render } from "react-dom";
import { useTranslation } from 'react-i18next';

import StoreContext from "@pega/react-sdk-components/lib/bridge/Context/StoreContext";
import createPConnectComponent from "@pega/react-sdk-components/lib/bridge/react_pconnect";

import { gbLoggedIn, loginIfNecessary, sdkSetAuthHeader } from '@pega/react-sdk-components/lib/components/helpers/authManager';

import { compareSdkPCoreVersions } from '@pega/react-sdk-components/lib/components/helpers/versionHelpers';
import { getSdkConfig } from '@pega/react-sdk-components/lib/components/helpers/config_access';
import { logout } from '@pega/react-sdk-components/lib/components/helpers/authManager';
import AppHeader from '../../components/AppComponents/AppHeader';
import AppFooter from '../../components/AppComponents/AppFooter';
import LanguageToggle from '../../components/AppComponents/LanguageToggle';
import LogoutPopup from '../../components/AppComponents/LogoutPopup';

import StartPage from './StartPage';
import ConfirmationPage from './ConfirmationPage';
import UserPortal from './UserPortal';
import ClaimsList from '../../components/templates/ClaimsList';
import setPageTitle from '../../components/helpers/setPageTitleHelpers';

import { getSdkComponentMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import localSdkComponentMap from '../../../sdk-local-component-map';
import { checkCookie, setCookie } from '../../components/helpers/cookie';


declare const myLoadMashup: any;

export default function ChildBenefitsClaim() {
  const [pConn, setPConn] = useState<any>(null);
  const [bShowPega, setShowPega] = useState(false);
  const [showStartPage, setShowStartPage] = useState(false);
  const [showUserPortal, setShowUserPortal] = useState(false);
  const [bShowAppName, setShowAppName] = useState(false);
  const [bShowResolutionScreen, setShowResolutionScreen] = useState(false);
  const [loadingsubmittedClaims, setLoadingSubmittedClaims] = useState(true);
  const [loadinginProgressClaims, setLoadingInProgressClaims] = useState(true);
  const [showSignoutModal, setShowSignoutModal] = useState(false);
  const [authType, setAuthType] = useState('gg');

  const { t } = useTranslation();
  let operatorId = '';

  useEffect(()=> {
    setPageTitle();
  }, [showStartPage, showUserPortal, bShowPega, bShowResolutionScreen]);

  const [inprogressClaims, setInprogressClaims] = useState([]);
  const [submittedClaims, setSubmittedClaims] = useState([]);

  function createCase() {
    setShowStartPage(false);
    setShowPega(true);
    PCore.getMashupApi().createCase('HMRC-ChB-Work-Claim', PCore.getConstants().APP.APP);
  }

  function startNow() {
    // Check if PConn is created, and create case if it is
    if (pConn) {
      createCase();
    }
  }

  function beginClaim() {
    setShowStartPage(true);
    setShowUserPortal(false);
  }

  function assignmentFinished() {
    setShowStartPage(false);
    setShowPega(false);
    setShowResolutionScreen(true);
  }

  function closeContainer(){
    setShowPega(false);
    setShowStartPage(false);
    setShowUserPortal(true);
    setShowResolutionScreen(false);
  }

  // Calls data page to fetch in progress claims, then for each result (limited to first 10), calls D_Claim to get extra details about each 'assignment'
  // to display within the claim 'card' in the list. This then sets inprogress claims state value to the list of claims data.
  // This funtion also sets 'isloading' value to true before making d_page calls, and sets it back to false after data claimed.
  function fetchInProgressClaimsData(){
    setLoadingInProgressClaims(true);
    let inProgressClaimsData : any = [];
    // @ts-ignore
    PCore.getDataPageUtils().getDataAsync('D_ClaimantWorkAssignmentChBCases', 'root').then(resp => {
      resp = resp.data.slice(0,10);
      inProgressClaimsData = resp;
      setInprogressClaims(inProgressClaimsData);
      setLoadingInProgressClaims(false);
    });
  };

  function cancelAssignment() {
    // PCore.getContainerUtils().closeContainerItem(PCore.getContainerUtils().getActiveContainerItemContext(`${PCore.getConstants().APP.APP}/primary`), {skipDirtyCheck :true});
    fetchInProgressClaimsData();
    setShowStartPage(false);
    setShowUserPortal(true);
    setShowPega(false);
    setShowResolutionScreen(false);
  }

  function establishPCoreSubscriptions() {
    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING,
      () => {
        assignmentFinished();
      },
      'assignmentFinished'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL,
      () => {
        cancelAssignment();
      },
      'cancelAssignment'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CONTAINER_EVENTS.CLOSE_CONTAINER_ITEM,
      () => {
        closeContainer();
      },
      'closeContainer'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.ASSIGNMENT_OPENED,
      () => {
        setShowStartPage(false);
        setShowUserPortal(false);
        setShowPega(true);
      },
      'continueAssignment'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CASE_CREATED,
      () => {
        setShowStartPage(false);
        setShowUserPortal(false);
        setShowPega(true);
      },
      'continueCase'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CREATE_STAGE_SAVED,
      () => {
        cancelAssignment()
      },
      'savedCase'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CASE_OPENED,
      () => {
        setShowStartPage(false);
        setShowUserPortal(false);
        setShowPega(true);
      },
      'continueCase'
    );
  }

  useEffect(() => {
    // Update visibility of UI when bShowPega changes
    const thePegaPartEl = document.getElementById('pega-part-of-page');
    const languageToggle = document.getElementById('hmrc-language-toggle');

    if (thePegaPartEl) {
      if (bShowPega) {
        thePegaPartEl.style.display = 'block';
        languageToggle.style.display = 'none';
      } else {
        thePegaPartEl.style.display = 'none';
        languageToggle.style.display = 'block';
      }
    }
  }, [bShowPega]);

  useEffect(() => {
    // Update when bShowAppName changes
    // If not logged in, we used to prompt for login. Now moved up to TopLevelApp
    // If logged in, make the Triple Play Options visible

    if (!gbLoggedIn) {
      // login();     // Login now handled at TopLevelApp
    } else {
      setShowUserPortal(true);
    }
  }, [bShowAppName]);

  // from react_root.js with some modifications
  function RootComponent(props) {
    const PegaConnectObj = createPConnectComponent();
    const thePConnObj = <PegaConnectObj {...props} />;

    // NOTE: For Embedded mode, we add in displayOnlyFA and isMashup to our React context
    // so the values are available to any component that may need it.
    const theComp = (
      <StoreContext.Provider
        value={{ store: PCore.getStore(), displayOnlyFA: true, isMashup: true }}
      >
        {thePConnObj}
      </StoreContext.Provider>
    );

    return theComp;
  }

  /**
   * Callback from onPCoreReady that's called once the top-level render object
   * is ready to be rendered
   * @param inRenderObj the initial, top-level PConnect object to render
   */
  function initialRender(inRenderObj) {
    // loadMashup does its own thing so we don't need to do much/anything here
    // // modified from react_root.js render
    const {
      props,
      domContainerID = null,
      componentName,
      portalTarget,
      styleSheetTarget
    } = inRenderObj;

    const thePConn = props.getPConnect();
    setPConn(thePConn);

    let target: any = null;

    if (domContainerID !== null) {
      target = document.getElementById(domContainerID);
    } else if (portalTarget !== null) {
      target = portalTarget;
    }

    // Note: RootComponent is just a function (declared below)
    const Component: any = RootComponent;

    if (componentName) {
      Component.displayName = componentName;
    }

    const theComponent = (
      <Component {...props} portalTarget={portalTarget} styleSheetTarget={styleSheetTarget} />
    );

    // Initial render of component passed in (which should be a RootContainer)
    render(
      <React.Fragment>
        {theComponent}
      </React.Fragment>,
      target
    )

    /* const root = render(target); // createRoot(container!) if you use TypeScript
    root.render(<>{theComponent}</>); */

    // Initial render to show that we have a PConnect and can render in the target location
    // render( <div>EmbeddedTopLevel initialRender in {domContainerID} with PConn of {componentName}</div>, target);
  }

  /**
   * kick off the application's portal that we're trying to serve up
   */
  function startMashup() {
    // NOTE: When loadMashup is complete, this will be called.
    PCore.onPCoreReady(renderObj => {
      // Check that we're seeing the PCore version we expect
      compareSdkPCoreVersions();
      establishPCoreSubscriptions();
      setShowAppName(true);

      // TODO : Consider refactoring 'en_GB' reference as this may need to be set elsewhere
      PCore.getEnvironmentInfo().setLocale(sessionStorage.getItem('rsdk_locale') || 'en_GB');
      PCore.getLocaleUtils().loadLocaleResources([PCore.getLocaleUtils().GENERIC_BUNDLE_KEY, '@BASECLASS!DATAPAGE!D_LISTREFERENCEDATABYTYPE']);
      initialRender(renderObj);

      operatorId = PCore.getEnvironmentInfo().getOperatorIdentifier();

      /* Functionality to set the device id in the header for use in CIP.
      Device id is unique and will be stored on the user device / browser cookie */
      const COOKIE_PEGAODXDI = 'pegaodxdi';
      let deviceID = checkCookie(COOKIE_PEGAODXDI);
      if (deviceID) {
        setCookie(COOKIE_PEGAODXDI, deviceID, 3650);
        PCore.getRestClient().getHeaderProcessor().registerHeader('deviceid', deviceID);
      } else {
        PCore.getDataPageUtils()
        .getPageDataAsync('D_UserSession', 'root' )
        .then(res => {
          deviceID = res.DeviceId;
          setCookie(COOKIE_PEGAODXDI, deviceID, 3650);
          PCore.getRestClient().getHeaderProcessor().registerHeader('deviceid', deviceID);
        });
      }

      setLoadingSubmittedClaims(true);
      // @ts-ignore
      PCore.getDataPageUtils()
        .getDataAsync('D_ClaimantSubmittedChBCases', 'root', {OperatorId: operatorId} )
        .then(resp => {
          setSubmittedClaims(resp.data.slice(0,10));
        })
        .finally(()=>setLoadingSubmittedClaims(false));
      fetchInProgressClaimsData();
    });

    // Initialize the SdkComponentMap (local and pega-provided)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    getSdkComponentMap(localSdkComponentMap).then( (theComponentMap: any) => {
    // eslint-disable-next-line no-console
    console.log(`SdkComponentMap initialized`);
    })

    // load the Mashup and handle the onPCoreEntry response that establishes the
    //  top level Pega root element (likely a RootContainer)

    myLoadMashup('pega-root', false); // this is defined in bootstrap shell that's been loaded already
  }

  // One time (initialization) subscriptions and related unsubscribe
  useEffect(() => {
    getSdkConfig().then(sdkConfig => {
      const sdkConfigAuth = sdkConfig.authConfig;
      setAuthType(sdkConfigAuth.authService);
      if (!sdkConfigAuth.mashupClientId && sdkConfigAuth.customAuthType === 'Basic') {
        // Service package to use custom auth with Basic
        const sB64 = window.btoa(
          `${sdkConfigAuth.mashupUserIdentifier}:${window.atob(sdkConfigAuth.mashupPassword)}`
        );
        sdkSetAuthHeader(`Basic ${sB64}`);
      }

      if (!sdkConfigAuth.mashupClientId && sdkConfigAuth.customAuthType === 'BasicTO') {
        const now = new Date();
        const expTime = new Date(now.getTime() + 5 * 60 * 1000);
        let sISOTime = `${expTime.toISOString().split('.')[0]}Z`;
        const regex = /[-:]/g;
        sISOTime = sISOTime.replace(regex, '');
        // Service package to use custom auth with Basic
        const sB64 = window.btoa(
          `${sdkConfigAuth.mashupUserIdentifier}:${window.atob(
            sdkConfigAuth.mashupPassword
          )}:${sISOTime}`
        );
        sdkSetAuthHeader(`Basic ${sB64}`);
      }

      // Login if needed, without doing an initial main window redirect
      loginIfNecessary('embedded', false);
    });

    document.addEventListener('SdkConstellationReady', () => {
      // start the portal
      startMashup();
    });

    document.addEventListener('SdkLoggedOut', () => {
      window.location.href = 'https://www.gov.uk/government/organisations/hm-revenue-customs';
    });

    // Subscriptions can't be done until onPCoreReady.
    //  So we subscribe there. But unsubscribe when this
    //  component is unmounted (in function returned from this effect)

    return function cleanupSubscriptions() {
      PCore?.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL,
        'cancelAssignment'
      );
      /* PCore?.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.ASSIGNMENT_OPENED,
        'continueAssignment'
      );
      PCore?.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.CASE_OPENED,
        'continueCase'
      );

      PCore?.getPubSubUtils().unsubscribe('closeContainer');
      PCore?.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING,
        'assignmentFinished'
      ); */
    };
  }, []);

  function signOut() {
  //  const authService = authType === 'gg' ? 'GovGateway' : (authType === 'gg-dev' ? 'GovGateway-Dev' : authType);
    let authService
    if(authType && authType === 'gg'){
      authService = 'GovGateway'
    }else if(authType && authType === 'gg-dev'){
      authService = 'GovGateway-Dev'
    }
    PCore.getDataPageUtils().getPageDataAsync('D_AuthServiceLogout', 'root', { AuthService: authService }).then(() => {
      logout().then(() => { })
    });
  }

  function handleSignout() {
    if (bShowPega) {
      setShowSignoutModal(true);
    } else {
      signOut();
    }
  }

  const handleStaySignIn = e => {
    e.preventDefault();
    setShowSignoutModal(false);
  };

  return (
    <>
      <AppHeader handleSignout={handleSignout} appname={t("CLAIM_CHILD_BENEFIT")} />
      <div className="govuk-width-container">

        <LanguageToggle PegaApp="true"/>
        <div id='pega-part-of-page'>
          <div id='pega-root'></div>
        </div>

        {showStartPage && <StartPage onStart={startNow} onBack={closeContainer} />}

        {showUserPortal && <UserPortal beginClaim={beginClaim}>

          {!loadinginProgressClaims && inprogressClaims.length !== 0 && (
            <ClaimsList
              thePConn={pConn}
              data={inprogressClaims}
              title={t("CLAIMS_IN_PROGRESS")}
              rowClickAction="OpenAssignment"
              buttonContent={t("CONTINUE_CLAIM")}
          />)}

          {!loadingsubmittedClaims && submittedClaims.length !== 0 && (
            <ClaimsList thePConn={pConn}
              data={submittedClaims}
              title=  {t("SUBMITTED_CLAIMS")}
              rowClickAction="OpenCase"
              buttonContent={t("VIEW_CLAIM")}
          />)}

      </UserPortal>}

      {bShowResolutionScreen && <ConfirmationPage />}

      </div>

      <LogoutPopup
        show={showSignoutModal}
        hideModal={() => setShowSignoutModal(false)}
        handleSignoutModal={signOut}
        handleStaySignIn={handleStaySignIn}
      />
      <AppFooter/>
    </>
  );
}
