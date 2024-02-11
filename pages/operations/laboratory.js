import  { useState, useEffect, useCallback, useContext } from 'react'
import MiniCard from '../../components/operations/miniCard'
import { customFetch } from '../../components/Auth/customFetch';
import SECOND_NO_DATA from '../../components/accessories/secondNodata';
import SettingsLayout from '../../components/settingsComponents/SettingsLayout';
import LabSideBarComponents from '../../components/operations/labSideBarComponents';
import AuthContext from '../../components/Auth/useAuthentification';
import Authorization from '../../components/accessories/authorization';

export default function OperationsOverview() {
  const { auth } = useContext(AuthContext);
  const [summary, setSummary] = useState([]);
  const [noDeptTest, setNoDeptTest] = useState(false);
  const [totalcount, setTotalCount] = useState(0)




  const getOperationsOverview = useCallback(async function () {
    const overview = await customFetch('operations/overview?stage=unentered');
    const { status, statusCode, result } = overview;
    if (statusCode == 200 && status == 'success') {
      if (result.length == 0) {
        setNoDeptTest(true)
      } else {
        setSummary(result);
        const len = result.reduce((a, b) => a + b.count, 0);
        setTotalCount(len)
      }
    }
  }, [])


  useEffect(() => {
    getOperationsOverview()
  }, [getOperationsOverview])



  const pageAuthorization = () => {
    if (!["scientist", "admin"].includes(auth?.role)) return <Authorization />
    else {
      if (noDeptTest) {
        return (
          <div className="mt-3">
            {" "}
            <SECOND_NO_DATA message={"No test added to departments"} />{" "}
          </div>
        )
      } else {
        return (
          <SettingsLayout sidebar={<LabSideBarComponents auth={auth} />}>
            <h4>{'>>> '}Pending Cases</h4>
            <hr />
            <div className="grid-30-30-30 pointer">
            <MiniCard
              number={totalcount}
              colorIndex={0}
              text={"all department"}
              color={"green"}
                link={`/operations/departments/all`}
            />
            {summary.map((item, index) => {
              return (
                <MiniCard
                  key={index}
                  number={item.count}
                  colorIndex={1 + index}
                  text={item.department}
                  color={"green"}
                  link={`/operations/departments/${item.id}`}

                />
              );
            })}
            </div>
          </SettingsLayout>
        )
      }
    }
  }




  return (
    <>
      {pageAuthorization()}
    </>
  );
}
