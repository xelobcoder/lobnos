import React from 'react';
import Comment from '../../comment';
import Labscientist from '../../labscientist';

export default function malaria() {
    return (
        <section>
            <form method="post" >
                <div >
                    <label>malaria parasite count</label>
                    <input type="number" className="form-control" required id="count" />
                </div>
                <div>
                    <label>parasite species</label>
                    <select className="form-control" id="species">
                        <option value = "plasmodium falciparum">Falciparum</option>
                        <option value = "plasmodium malariae">malariae</option>
                        <option value = "plasmodium ovale">ovale</option>
                        <option value = "plasmodium vivax">vivax</option>
                    </select>
                </div>
                <div>
                    <label>parasite stage</label>
                    <select className="form-control" id="stage">
                        <option value="trophozoites">trophozoites</option>
                        <option value="gametocytes">Gametocytes</option>
                    </select>
                </div>
                <Comment/>
                <Labscientist/>
                <button type="button" className="btn btn-outline-primary mt-3" id="save">
                    save
                </button>
            </form>
        </section>
    )
}
