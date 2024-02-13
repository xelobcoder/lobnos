import  { useState, useEffect, useCallback, useContext } from 'react'
import MiniCard from '../../components/operations/miniCard'
import { customFetch } from '../../components/Auth/customFetch';
import LaboratoryLayout from '../../components/operations/LaboratoryLayout';

export default function OperationsOverview() {
  const [summary, setSummary] = useState([]);
  const [noDeptTest, setNoDeptTest] = useState(false);
  const [totalcount, setTotalCount] = useState(0);


  const getOperationsOverview = useCallback(async function () {
    const overview = await customFetch('operations/overview?stage=unentered');
    const { status, statusCode, result } = overview;
    if (statusCode == 200 && status == 'success') {
      if (result.length == 0) {
        setNoDeptTest(true);
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
      if (noDeptTest) {
        return (
          <div className="mt-3 pointer">
            <MiniCard
              number={totalcount}
              colorIndex={0}
              text={"all department"}
              color={"green"}
              link={totalcount > 0 ? `/operations/departments/all` : '/operations/laboratory'}
            />
          </div>
        )
      } else {
        return (
          <div>
            <h4>{'>>> '}Pending Cases</h4>
            <hr />
            <div className="grid-30-30-30 pointer">
            <MiniCard
              number={totalcount}
              colorIndex={0}
              text={"all department"}
              color={"green"}
                link={totalcount > 0 ? `/operations/departments/all` : '/operations/laboratory'}
            />
            {summary.map((item, index) => {
              return (
                <MiniCard
                  key={index}
                  number={item.count}
                  colorIndex={1 + index}
                  text={item.department}
                  color={"green"}
                  link={item.count > 0 ? `/operations/departments/${item.departmentid}` : '/operations/laboratory'} />
              );
            })}
            </div>
          </div>
        )
      }
  }




  return (
    <LaboratoryLayout>
      {pageAuthorization()}
    </LaboratoryLayout>
  );
}
