import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons/faExclamationCircle";
import React from "react";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";

export enum BannerType {
  warning,
  error,
  info,
}

export type BannerProps = {
  type: BannerType;
  text: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
};

const getIcon = (type: BannerType) => {
  if (type === BannerType.warning) {
    return <FontAwesomeIcon icon={faExclamationCircle} fixedWidth={true} />;
  } else if (type === BannerType.error) {
    return <FontAwesomeIcon icon={faExclamationCircle} fixedWidth={true} />;
  } else if (type === BannerType.info) {
    return <FontAwesomeIcon icon={faInfoCircle} fixedWidth={true} />;
  } else {
    return null;
  }
};

const getCssClass = (type: BannerType) => {
  if (type === BannerType.warning) {
    return "is-warning";
  } else if (type === BannerType.error) {
    return "is-danger";
  } else if (type === BannerType.info) {
    return "is-info";
  } else {
    return null;
  }
};

export const Banner = ({
  type,
  text,
  buttonLabel,
  onButtonClick,
}: BannerProps) => {
  return (
    <div className={`notification has-text-black ${getCssClass(type)}`}>
      <div className="columns is-mobile">
        <div className="column is-narrow">{getIcon(type)}</div>
        <div className="column">{text}</div>
        {buttonLabel && (
          <div className="column is-narrow">
            <button onClick={onButtonClick}>{buttonLabel}</button>
          </div>
        )}
      </div>
    </div>
  );
};
