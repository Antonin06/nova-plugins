import apiFetch from "@wordpress/api-fetch";
import domReady from "@wordpress/dom-ready";
import { createRoot, useEffect } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import {
  Panel,
  PanelBody,
  PanelRow,
  TextareaControl,
  ToggleControl,
  FontSizePicker,
  Button,
  NoticeList,
  __experimentalHeading as Heading,
} from "@wordpress/components";
import { useState } from "@wordpress/element";
import { useDispatch, useSelect } from "@wordpress/data";
import { store as noticesStore } from "@wordpress/notices";

const useSettings = () => {
  const [message, setMessage] = useState();
  const [display, setDisplay] = useState();
  const [size, setSize] = useState();

  const { createSuccessNotice } = useDispatch(noticesStore);

  useEffect(() => {
    apiFetch({ path: "/wp/v2/settings" }).then((settings) => {
      setMessage(settings.unadorned_announcement_bar.message);
      setDisplay(settings.unadorned_announcement_bar.display);
      setSize(settings.unadorned_announcement_bar.size);
    });
  }, []);

  const saveSettings = () => {
    apiFetch({
      path: "/wp/v2/settings",
      method: "POST",
      data: {
        unadorned_announcement_bar: {
          message,
          display,
          size,
        },
      },
    }).then(() => {
      createSuccessNotice(
        __("Settings saved.", "unadorned-announcement-bar"),
      ).then((r) => {
        console.log(r);
      });
    });
  };

  return {
    message,
    setMessage,
    display,
    setDisplay,
    size,
    setSize,
    saveSettings,
  };
};

const SettingsPage = () => {
  const {
    message,
    setMessage,
    display,
    setDisplay,
    size,
    setSize,
    saveSettings,
  } = useSettings();

  return (
    <>
      <SettingsTitle />
      <Notices />
      <Panel>
        <PanelBody>
          <PanelRow>
            <MessageControl
              value={message}
              onChange={(value) => setMessage(value)}
            />
          </PanelRow>
          <PanelRow>
            <DisplayControl
              value={display}
              onChange={(value) => setDisplay(value)}
            />
          </PanelRow>
        </PanelBody>
        <PanelBody
          title={__("Appearance", "unadorned-announcement-bar")}
          initialOpen={false}
        >
          <PanelRow>
            <SizeControl value={size} onChange={(value) => setSize(value)} />
          </PanelRow>
        </PanelBody>
      </Panel>
      <SaveButton onClick={saveSettings} />
    </>
  );
};

const Notices = () => {
  const { removeNotice } = useDispatch(noticesStore);
  const notices = useSelect((select) => select(noticesStore).getNotices());

  if (notices.length === 0) {
    return null;
  }

  return <NoticeList notices={notices} onRemove={removeNotice} />;
};

const SettingsTitle = () => {
  return (
    <Heading level={1}>
      {__("Unadorned Announcement Bar", "unadorned-announcement-bar")}
    </Heading>
  );
};
const MessageControl = ({ value, onChange }) => {
  return (
    <TextareaControl
      label={__("Message", "unadorned-announcement-bar")}
      value={value}
      onChange={onChange}
      __nextHasNoMarginBottom
    />
  );
};

const DisplayControl = ({ value, onChange }) => {
  return (
    <ToggleControl
      checked={value}
      label={__("Display", "unadorned-announcement-bar")}
      onChange={onChange}
      __nextHasNoMarginBottom
    />
  );
};

const SizeControl = ({ value, onChange }) => {
  return (
    <FontSizePicker
      fontSizes={[
        {
          name: __("Small", "unadorned-announcement-bar"),
          size: "small",
          slug: "small",
        },
        {
          name: __("Medium", "unadorned-announcement-bar"),
          size: "medium",
          slug: "medium",
        },
        {
          name: __("Large", "unadorned-announcement-bar"),
          size: "large",
          slug: "large",
        },
        {
          name: __("Extra Large", "unadorned-announcement-bar"),
          size: "x-large",
          slug: "x-large",
        },
      ]}
      value={value}
      onChange={onChange}
      disableCustomFontSizes={true}
      __next40pxDefaultSize
      __nextHasNoMarginBottom
    />
  );
};

const SaveButton = ({ onClick }) => {
  return (
    <Button variant="primary" onClick={onClick} __next40pxDefaultSize>
      {__("Save", "unadorned-announcement-bar")}
    </Button>
  );
};

domReady(() => {
  const root = createRoot(
    document.getElementById("unadorned-announcement-bar-settings"),
  );

  root.render(<SettingsPage />);
});
