import React from 'react';
import Validator from '../../validator';
import Comment from '../../comment';

export default function malaria() {
    return (
        <section>
            <form method="post" >
                <label>malaria parasite count</label>
                <input type="number" className="form-control" required id="count" />
                <label>parasite species</label>
                <select>
                    <option value = "plasmodium falciparum"></option>
                    <option value = "plasmodium malariae">malariae</option>
                    <option value = "plasmodium ovale">ovale</option>
                    <option value = "plasmodium vivax">vivax</option>
                </select>
                <label>parasite stage</label>
                <select>
                    <option value="trophozoites">trophozoites</option>
                    <option value="gametocytes">Gametocytes</option>
                </select>
                <Comment/>
                <Validator/>
                <button type="button" className="btn btn-outline-primary" id="save">
                    save
                </button>
            </form>
        </section>
    )
}
