import React from 'react';

export default function LiverFunctionTest() {
  return (
    <div>
      <section>
          <form className="form" method="post">
              <header>Liver function test</header>
              <label htmlFor="alt">alt</label>
              <input type="number" className="form-control" id="alt" placeholder="alt" />
              <label>ast</label>
              <input type="number" className="form-control" id="ast" placeholder="ast" />
              <label>ast/alp</label>
              <input type="number" className="form-control" id="ast-alp-ratio"  placeholder="ast/alp ratio"/>
              <label>alp</label>
              <input type="number" className="form-control" id="alp" placeholder="alp" />
              <label>ggt</label>
              <input type="number" className="form-control" id="ggt" placeholder="ggt"/>
              <label>total protein</label>
              <input type="number" className="form-control" id="totalprotein" placeholder="total protein" />
              <label>globulin</label>
              <input type="number" className="form-control" id="globulin"  placeholder="globulin"/>
              <label>albumen/globulin ratio</label>
              <input type="number" className="form-control" id="alb-glo-ratio" placeholder="alb/glo ratio"/>
              <label>total bilirubin</label>
              <input type="number" className="form-control" id="totalbilirubin" placeholder="total bil"/>
              <label>direct bilirubin</label>
              <input type="number" className="form-control" id="directBilirubin" placeholder="direct bil"/>
              <label> indirect bilirubin</label>
              <input type="number" className="form-control" id="indirectBilirubin" placeholder="indirect bil"/>
              <button type="button" className="btn btn-warning mt-3 pl-4 pr-4" >save result</button>
          </form>
      </section>
    </div>
  );
}
