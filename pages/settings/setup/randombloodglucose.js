import CHEMISTRY_LAYOUT_SETUP from '../../../components/setup/biochemistry/Layout';
import { glucoseParams } from '../../../components/setup/connector';
import PARAMETER_DISPLAY_COMPONENT from '../../../components/setup/parameterDisplay';

export default function RANDOMBLOODSUGAR_SETUP() {
  return (
    <div>
      <CHEMISTRY_LAYOUT_SETUP>
        <PARAMETER_DISPLAY_COMPONENT parameterdata={glucoseParams} testname={'random_blood_sugar'} />
      </CHEMISTRY_LAYOUT_SETUP>
    </div>
  )
}
