import React from 'react';
import CHEMISTRY_LAYOUT_SETUP from '../../../components/setup/biochemistry/Layout';
import FullBloodCountSetup from '../../../components/setup/biochemistry/hematology/fbcsetup';

export default function FULLBLOODCOUNT() {
  return (
    <>
    <CHEMISTRY_LAYOUT_SETUP>
      <FullBloodCountSetup/>
    </CHEMISTRY_LAYOUT_SETUP>
    </>
  )
}
