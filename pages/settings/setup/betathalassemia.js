import CHEMISTRY_LAYOUT_SETUP from "../../../components/setup/biochemistry/Layout";
import PARAMETER_DISPLAY_COMPONENT from "../../../components/setup/parameterDisplay";
import betathalassemia from '../../../components/setup/betathalassemiaParameters';
export default function BetaThalassemiaSetUp() {
    return (
        <>
        <CHEMISTRY_LAYOUT_SETUP>
          <PARAMETER_DISPLAY_COMPONENT
          parameterdata={betathalassemia}
          testname={'beta_thalassemia'}
        />
      </CHEMISTRY_LAYOUT_SETUP>
        </>
    )
}