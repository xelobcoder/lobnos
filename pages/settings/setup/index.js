import CHEMISTRY_LAYOUT_SETUP from '../../../components/setup/biochemistry/Layout';
import Image from 'next/image';

export default function TestPanelsSetup() {
  return (
    <>
      <CHEMISTRY_LAYOUT_SETUP>
        <div className="bg-white p-2 d-flex mt-4 flex-column br-7 justify-content-center align-items-center">
          <Image
            src={"/asserts/ill-nodata.jpg"}
            height={200}
            property="prority"
            style={{ backgroundColor: 'transparent' }}
            alt="No Test selected"
            width={300}
          />
          <span className="bg-warning p-3 lead rounded pointer text-primary">
            click on a test on the side panel to edit test parameters
          </span>
        </div>
      </CHEMISTRY_LAYOUT_SETUP>
    </>
  )
}


