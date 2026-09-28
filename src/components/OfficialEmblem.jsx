import React from 'react';
import slEmblemTransImg from '../assets/sl_emblem_trans.png';
import irdLogoTransImg from '../assets/ird_logo_trans.png';

/**
 * Official Sri Lanka National State Emblem
 * Transparent background - pure logo icon
 */
export function SriLankaNationalCrest({ size = 52, className = '', style = {} }) {
  return (
    <img
      src={slEmblemTransImg}
      alt="Official State Emblem of the Democratic Socialist Republic of Sri Lanka"
      className={`official-sl-crest ${className}`}
      style={{
        height: typeof size === 'number' ? `${size}px` : size,
        width: 'auto',
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        display: 'block',
        filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.4))',
        ...style,
      }}
    />
  );
}

/**
 * Official Inland Revenue Department (IRD) Logo
 * Transparent background - pure logo icon
 */
export function IRDCrest({ size = 48, className = '', style = {} }) {
  return (
    <img
      src={irdLogoTransImg}
      alt="Department of Inland Revenue Sri Lanka Official Logo"
      className={`official-ird-crest ${className}`}
      style={{
        height: typeof size === 'number' ? `${size}px` : size,
        width: 'auto',
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        display: 'block',
        ...style,
      }}
    />
  );
}

export default {
  SriLankaNationalCrest,
  IRDCrest,
};
