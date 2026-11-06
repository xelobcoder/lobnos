import {softwareManualOverview as overview} from '../../lib/softwareManualOverview';
export default function SoftwareManualIntroduction(){return <section id="manual-software">
 <h2>{overview.title}</h2><p>{overview.purpose}</p>
 <h3>Our operating philosophy</h3><dl>{overview.philosophy.map(([title,text])=><div key={title}><dt>{title}</dt><dd>{text}</dd></div>)}</dl>
 <h3>How PLS supports the organization</h3><dl>{overview.organizationalValue.map(([title,text])=><div key={title}><dt>{title}</dt><dd>{text}</dd></div>)}</dl>
 <h3>Modules and manual coverage</h3><p>Only enabled modules and permitted actions appear in your workspace. The descriptions below are an orientation, not a permission list.</p>
 <dl>{overview.modules.map(([title,text,coverage])=><div key={title}><dt>{title}</dt><dd>{text}<p><strong>Manual coverage:</strong> {coverage}</p></dd></div>)}</dl>
 <h3>Recognize the front-desk workspace</h3>{overview.figures.map(figure=><figure key={figure.file}><a href={`/manuals/pilots/${figure.file}`} target="_blank" rel="noopener noreferrer"><img src={`/manuals/pilots/${figure.file}`} alt={figure.caption} style={{maxWidth:"100%",height:"auto"}} loading="lazy"/></a><figcaption>{figure.caption} Open the image to enlarge.</figcaption></figure>)}
 <h3>How work moves between teams</h3><ol>{overview.journey.map(([actor,action,evidence])=><li key={actor}><strong>{actor}.</strong> {action}<p><strong>Handoff evidence:</strong> {evidence}</p></li>)}</ol>
 <h3>Recommended learning sequence</h3><ol>{overview.readingOrder.map(text=><li key={text}>{text}</li>)}</ol>
 <h3>Scope of this edition</h3><p>{overview.scope}</p>
 </section>}
