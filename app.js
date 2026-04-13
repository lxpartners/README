var SECTIONS = 8;
var cmdState = {1: false, 2: false};
var docFiles = {};
var currentLang = 'pt';
var currentType = 'singular';
var pdfDoc = null;
var titularCount = 0;
var currentModo = 'interno';

/* ── GDPR DROPDOWN ── */
function toggleGdpr() {
  var body = document.getElementById('gdpr-body');
  var chevron = document.getElementById('gdpr-chevron');
  var isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
}

/* ── MODO ── */
function toggleModo() {
  currentModo = currentModo === 'interno' ? 'cliente' : 'interno';
  applyModo();
  try { localStorage.setItem('alyx_kyc_modo', currentModo); } catch(e) {}
}
function applyModo() {
  var isCliente = currentModo === 'cliente';
  document.body.classList.toggle('cliente-mode', isCliente);
  var banner = document.getElementById('modo-banner');
  banner.classList.toggle('cliente-mode', isCliente);
  if (isCliente) {
    document.getElementById('modo-label').textContent = 'Modo Cliente';
    document.getElementById('modo-desc').textContent = '— referência interna oculta · imóvel só de leitura';
    document.getElementById('modo-btn-label').textContent = 'Voltar ao Modo Interno';
    document.querySelectorAll('.readonly-section input,.readonly-section select,.readonly-section textarea').forEach(function(el) {
      el.setAttribute('readonly', '');
      el.setAttribute('tabindex', '-1');
    });
  } else {
    document.getElementById('modo-label').textContent = 'Modo Interno';
    document.getElementById('modo-desc').textContent = '— todas as secções visíveis e editáveis';
    document.getElementById('modo-btn-label').textContent = 'Mudar para Modo Cliente';
    document.querySelectorAll('.readonly-section input,.readonly-section select,.readonly-section textarea').forEach(function(el) {
      if (el.id !== 'ref_interna') el.removeAttribute('readonly');
      el.removeAttribute('tabindex');
    });
  }
}

/* ── TRANSLATIONS ── */
var T = {
  pt: {
    badge:'Formulário KYC · Confidencial', toast_title:'Campos obrigatórios em falta',
    cover_sub:'AMI n.º 20468 · NIPC 516351974 · Lei n.º 83/2017 · Confidencial<br>Preencha todas as secções aplicáveis. <span style="color:var(--err)">*</span> Campo obrigatório.',
    type_singular:'Pessoa Singular', type_coletiva:'Pessoa Coletiva',
    ref_clbl:'Referência do processo', ref_owner:'Proprietário', ref_refint:'Referência interna', ref_id:'ID Imóvel', ref_nipc:'NIPC', ref_auto:'Gerada automaticamente',
    a_title:'Identificação do Imóvel', a_sub:'Informação básica do imóvel objeto da proposta.', a_clbl:'Dados do imóvel', a_address:'Morada completa', a_cp:'Código Postal', a_city:'Localidade', a_owner:'Proprietário', a_nipc:'NIPC',
    g_title:'Mediação Imobiliária', g_sub:'Preencha apenas se aplicável.', g_company:'Denominação Social', g_brand:'Marca (se aplicável)', g_ami:'Licença AMI', g_resp:'Responsável',
    b_title:'Proposta', b_sub:'Condições e estrutura financeira.', b_clbl:'Dados da proposta', b_purpose:'Propósito do Negócio',
    b_dest:'Destino do Bem', b_dest_hab:'Habitação', b_dest_arr:'Arrendamento', b_dest_rev:'Revenda', b_dest_inv:'Investimento', b_dest_other:'Outro',
    b_value:'Valor da Proposta (€)', b_signal:'Sinal CPCV (€)', b_deadline:'Prazo para Escritura',
    b_funds:'Fundos', b_funds_own:'Próprios', b_funds_fin:'Financiamento', b_funds_mix:'Mistos',
    b_fin_pct:'% Financiamento', b_fin_bank:'Banco Financiador',
    b_funds_origin:'Proveniência de Fundos Próprios', b_fo_dep:'Depósito bancário', b_fo_sale:'Venda de ativo', b_fo_sav:'Poupanças',
    b_pay_clbl:'Meios de Pagamento', b_pay_method:'Meio de Pagamento', b_pay_cheque:'Cheque bancário / visado', b_pay_transfer:'Transferência bancária',
    b_iban_cheque:'Banco e IBAN', b_iban_transfer:'IBAN', b_obs:'Observações',
    c_title:'Proponente — Pessoa Singular', c_sub:'Use "N/A" onde não aplicável.', c_clbl:'Dados Pessoais — Proponente 1',
    c_name:'Nome Completo', c_dob:'Data de Nascimento', c_birth_place:'Naturalidade (freguesia e concelho)', c_nationality:'Nacionalidade',
    c_doc_clbl:'Documento de Identificação', c_doc_type:'Tipo',
    doc_cc:'BI / Cartão de Cidadão', doc_passport:'Passaporte', doc_res:'Título de Residência', doc_other:'Outro',
    c_docnum:'N.º Documento', c_issue_date:'Data de Emissão', c_issuer:'Entidade Emitente', c_expiry:'Válido até',
    c_fiscal_clbl:'Fiscal & Residência', c_nif:'NIF Nacional', c_nif_foreign:'NIF Estrangeiro / País', c_residence:'Residência Permanente', c_fiscal_res:'Residência Fiscal (se diferente)',
    c_prof_clbl:'Dados Profissionais & Contacto', c_profession:'Profissão', c_employer:'Entidade Patronal',
    c_civil:'Estado Civil', civil_married:'Casado/a', civil_single:'Solteiro/a', civil_div:'Divorciado/a', civil_widow:'Viúvo/a',
    c_regime:'Regime de Casamento', reg_joint:'Comunhão geral de bens', reg_acq:'Comunhão de adquiridos', reg_sep:'Separação total de bens',
    c_phone:'Telefone', c_email:'Email',
    conj_q:'Existe cônjuge?', yn_yes:'Sim', yn_no:'Não', conj_clbl:'Dados do Cônjuge', conj_also_prop:'É também Proponente?',
    cc_title:'Proponente — Pessoa Coletiva', cc_sub:'Identificação da entidade proponente.',
    cc_id_clbl:'Identificação da Empresa', cc_denom:'Denominação Social', cc_nipc:'NIPC', cc_cae:'CAEs', cc_objeto:'Objeto Social', cc_sede:'Morada da Sede',
    cc_forma:'Forma Jurídica', cc_marca:'Marca (se aplicável)', cc_constituicao:'Data de Constituição', cc_pais_const:'País de Constituição', cc_sucursais:'Sucursais / Delegações',
    cc_contact_clbl:'Responsável de Contacto', cc_resp_nome:'Nome Responsável',
    cc_rcbe_clbl:'Registo Central do Beneficiário Efetivo', cc_rcbe_code:'Código RCBE',
    cc_titulares_title:'Secção E — Titulares', cc_titulares_sub:'Titulares dos Órgãos de Administração, participações ≥ 5% e Beneficiários Efetivos.',
    cc_add_titular:'Adicionar Titular', cc_titular_lbl:'Titular', cc_titular_remove:'Remover',
    tit_name:'Nome', tit_cargo:'Cargo', tit_cargo_ph:'Administrador, Gerente, Procurador, outro', tit_capital:'% Capital detido', tit_be:'Beneficiário Efetivo?', tit_nac1:'Nacionalidade 1', tit_nac2:'Outras Nacionalidades', tit_docnum:'N.º Doc. Id.', tit_emissao:'Data de Emissão', tit_entidade:'Entidade Emitente', tit_validade:'Válido até', tit_nif:'NIF Nacional', tit_nif_est:'NIF Estrangeiro/País', tit_res:'Morada de Residência Permanente e País', tit_resf:'Morada de Residência Fiscal (se diferente) e País',
    d_title:'Representante Legal', d_sub:'Preencha apenas se existir representante legal.', d_q:'Existe Representante Legal?', d_personal_clbl:'Dados Pessoais & Identificação',
    e_title:'Pessoa Politicamente Exposta', e_sub:'Artigos 2.º, n.º 1, alíneas cc), w) e dd), e artigos 19.º e 39.º da Lei n.º 83/2017.',
    e_q1_lbl:'Questão 1', e_q1:'Algum interveniente é ou foi PeP nos últimos 12 meses?', e_q2_lbl:'Questão 2', e_q2:'Algum interveniente é familiar próximo de uma PeP?', e_q3_lbl:'Questão 3', e_q3:'Algum interveniente mantém estreitas relações societárias ou comerciais com uma PeP?', e_q4_lbl:'Questão 4', e_q4:'Algum interveniente é ou foi titular de outro cargo político ou público em Portugal nos últimos 12 meses?',
    e_party:'Interveniente', e_role:'Cargo', e_country:'País', e_since:'Início de exercício', e_until:'Fim de exercício', e_pep_name:'Nome do PeP', e_pep_role:'Cargo do PeP', e_kinship:'Grau de Parentesco', e_rel_type:'Tipo de Relação',
    f_title:'Documentos Obrigatórios', f_sub:'Carregue cada documento. <span style="color:var(--err)">*</span> Obrigatório para submissão.',
    f_id_clbl:'Identificação & Fiscal', f_res_clbl:'Residência & Rendimentos', fcc_id_clbl:'Documentos da Empresa', fcc_doc_rc:'Certidão do Registo Comercial e RCBE', fcc_doc_ids:'Cópia dos documentos de identificação dos Titulares', fcc_doc_nif:'Comprovativo de NIF', fcc_doc_delib:'Deliberação da Assembleia Geral / Procuração',
    f_doc_id:'Cópia do(s) documento(s) de identificação do(s) Proponente(s)', f_doc_nif:'Comprovativo de NIF', f_doc_poa:'Procuração', if_applicable:'(se aplicável)', f_doc_utility:'Fatura de serviço público com menos de 3 meses', f_doc_iban:'Comprovativo de IBAN da conta de origem dos fundos',
    f_doc_err:'Documento obrigatório em falta', f_doc_err_sel:'Seleccionou esta opção — o documento é obrigatório',
    f_funds_clbl:'Comprovativo da Origem de Fundos', f_funds_min:'— pelo menos 1 obrigatório', f_doc_deed:'Escritura / Contrato de compra e venda de ativos', f_doc_bankdec:'Declaração bancária de titularidade e suficiência', f_doc_stmt:'Extrato bancário', f_doc_payslip2:'Recibos de vencimento / Declaração de IRS', f_doc_reports:'Relatórios de contas', f_doc_other_note:'(conforme a origem dos fundos)', f_funds_err:'↑ Pelo menos um comprovativo de origem de fundos é obrigatório',
    h_title:'Proteção de Dados & Declarações', h_sub:'Por favor, leia atentamente antes de assinar.',
    h_gdpr_title:'Proteção de Dados Pessoais', h_decl_title:'Declarações do(s) Proponente(s)',
    h_sign_clbl:'Assinaturas', h_how_title:'Como funciona', h_how_text:'Opção A — Exporte o formulário pré-preenchido em PDF, assine fisicamente e faça upload. Opção B — Autentique digitalmente com Chave Móvel Digital.',
    h_export_btn:'Exportar formulário pré-preenchido (PDF)', h_export_skip:'Exportar sem validação (rascunho)',
    h_p1_lbl:'Proponente 1', h_p2_lbl:'Proponente 2 / Representante Legal', h_place:'Local', h_date:'Data',
    h_cmd_btn:'Autenticar com Chave Móvel Digital', h_upload_sign:'Upload de assinatura física', h_upload_click:'Clique para fazer upload do documento assinado', h_cmd_note:'A autenticação CMD é efetuada no portal oficial do Estado.',
    legal_title:'Definições Legais', legal_sub:'Lei n.º 83/2017 — apenas para referência.', legal_btn_open:'Ver notas legais', legal_btn_close:'Fechar notas legais',
    legal_pep_title:'Pessoas Politicamente Expostas (PeP)', legal_pep_text:'Pessoas singulares que desempenham ou desempenharam nos últimos 12 meses funções públicas de nível superior.', legal_be_title:'Beneficiário Efetivo', legal_be_text:'A pessoa ou pessoas singulares que, em última instância, detêm a propriedade ou o controlo do cliente.', legal_family_title:'Membros próximos da família', legal_family_text:'(art. 2.º, n.º 1, al. w): cônjuge ou unido de facto; parentes e afins em 1.º grau.', legal_assoc_title:'Pessoas estreitamente associadas', legal_assoc_text:'(art. 2.º, n.º 1, al. dd): comproprietário com PeP; titular de capital de pessoa coletiva cujo beneficiário efetivo seja PeP.',
    bar_saved:'Progresso guardado', bar_sub:'Os dados são guardados automaticamente neste browser.', bar_close:'Fechar', bar_submit:'Submeter formulário', bar_save:'Guardar progresso', bar_tab:'Barra de ações', prog_section:'Secção', prog_of:'de',
    submit_pending:'⏳ Submissão pendente', submit_backend:'Backend não configurado.', docs_missing:'⚠ Documentos em falta', docs_missing_sub:'Faltam: {0}.', save_ok:'✓ Progresso guardado', save_time:'Guardado às ', pdf_preview_title:'Pré-visualização do PDF', pdf_download_btn:'Descarregar PDF'
  },
  en: {
    badge:'KYC Form · Confidential', toast_title:'Required fields missing',
    cover_sub:'AMI No. 20468 · NIPC 516351974 · Law No. 83/2017 · Confidential<br>Fill in all applicable sections. <span style="color:var(--err)">*</span> Required field.',
    type_singular:'Individual', type_coletiva:'Legal Entity',
    ref_clbl:'Process reference', ref_owner:'Owner', ref_refint:'Internal reference', ref_id:'Property ID', ref_nipc:'NIPC', ref_auto:'Generated automatically',
    a_title:'Property Identification', a_sub:'Basic information about the property.', a_clbl:'Property details', a_address:'Full address', a_cp:'Postcode', a_city:'City', a_owner:'Owner', a_nipc:'NIPC',
    g_title:'Real Estate Agency', g_sub:'Fill in only if applicable.', g_company:'Company Name', g_brand:'Brand (if applicable)', g_ami:'AMI Licence', g_resp:'Responsible',
    b_title:'Proposal', b_sub:'Financial conditions.', b_clbl:'Proposal details', b_purpose:'Business Purpose',
    b_dest:'Intended Use', b_dest_hab:'Residence', b_dest_arr:'Rental', b_dest_rev:'Resale', b_dest_inv:'Investment', b_dest_other:'Other',
    b_value:'Offer Value (€)', b_signal:'CPCV Deposit (€)', b_deadline:'Deed Deadline',
    b_funds:'Funds', b_funds_own:'Own funds', b_funds_fin:'Financing', b_funds_mix:'Mixed',
    b_fin_pct:'% Financing', b_fin_bank:'Financing Bank',
    b_funds_origin:'Source of Own Funds', b_fo_dep:'Bank deposit', b_fo_sale:'Asset sale', b_fo_sav:'Savings',
    b_pay_clbl:'Payment Methods', b_pay_method:'Payment Method', b_pay_cheque:'Bank / certified cheque', b_pay_transfer:'Bank transfer',
    b_iban_cheque:'Bank & IBAN', b_iban_transfer:'IBAN', b_obs:'Observations',
    c_title:'Proposer — Individual', c_sub:'Use "N/A" where not applicable.', c_clbl:'Personal Data — Proposer 1',
    c_name:'Full Name', c_dob:'Date of Birth', c_birth_place:'Place of Birth', c_nationality:'Nationality',
    c_doc_clbl:'Identification Document', c_doc_type:'Type',
    doc_cc:'National ID / Citizen Card', doc_passport:'Passport', doc_res:'Residence Permit', doc_other:'Other',
    c_docnum:'Document No.', c_issue_date:'Issue Date', c_issuer:'Issuing Authority', c_expiry:'Valid until',
    c_fiscal_clbl:'Tax & Residence', c_nif:'National Tax ID (NIF)', c_nif_foreign:'Foreign Tax ID / Country', c_residence:'Permanent Residence', c_fiscal_res:'Tax Residence (if different)',
    c_prof_clbl:'Professional & Contact Details', c_profession:'Profession', c_employer:'Employer',
    c_civil:'Marital Status', civil_married:'Married', civil_single:'Single', civil_div:'Divorced', civil_widow:'Widowed',
    c_regime:'Matrimonial Regime', reg_joint:'Joint ownership', reg_acq:'Community of acquired assets', reg_sep:'Separate ownership',
    c_phone:'Phone', c_email:'Email',
    conj_q:'Is there a spouse?', yn_yes:'Yes', yn_no:'No', conj_clbl:'Spouse Details', conj_also_prop:'Also a Proposer?',
    cc_title:'Proposer — Legal Entity', cc_sub:'Identification of the proposing entity.',
    cc_id_clbl:'Company Identification', cc_denom:'Company Name', cc_nipc:'NIPC', cc_cae:'CAE Codes', cc_objeto:'Corporate Purpose', cc_sede:'Registered Address',
    cc_forma:'Legal Form', cc_marca:'Brand (if applicable)', cc_constituicao:'Incorporation Date', cc_pais_const:'Country of Incorporation', cc_sucursais:'Branches / Offices',
    cc_contact_clbl:'Contact Person', cc_resp_nome:'Contact Name',
    cc_rcbe_clbl:'Central Register of Beneficial Ownership', cc_rcbe_code:'RCBE Code',
    cc_titulares_title:'Section E — Holders', cc_titulares_sub:'Holders of management bodies, shareholdings ≥ 5% and Beneficial Owners.',
    cc_add_titular:'Add Holder', cc_titular_lbl:'Holder', cc_titular_remove:'Remove',
    tit_name:'Name', tit_cargo:'Position', tit_cargo_ph:'Administrator, Manager, Attorney, other', tit_capital:'% Capital held', tit_be:'Beneficial Owner?', tit_nac1:'Nationality 1', tit_nac2:'Other Nationalities', tit_docnum:'Doc. No.', tit_emissao:'Issue Date', tit_entidade:'Issuing Authority', tit_validade:'Valid until', tit_nif:'National Tax ID', tit_nif_est:'Foreign Tax ID / Country', tit_res:'Permanent Residence Address and Country', tit_resf:'Tax Residence Address (if different) and Country',
    d_title:'Legal Representative', d_sub:'Fill in only if a legal representative exists.', d_q:'Is there a Legal Representative?', d_personal_clbl:'Personal & Identification Data',
    e_title:'Politically Exposed Person', e_sub:'Articles 2(1)(cc), (w) and (dd), and Articles 19 and 39 of Law No. 83/2017.',
    e_q1_lbl:'Question 1', e_q1:'Is any party a PEP or was one in the last 12 months?', e_q2_lbl:'Question 2', e_q2:'Is any party a close family member of a PEP?', e_q3_lbl:'Question 3', e_q3:'Does any party maintain close business or commercial relations with a PEP?', e_q4_lbl:'Question 4', e_q4:'Is any party a holder of another political or public office in Portugal in the last 12 months?',
    e_party:'Party', e_role:'Position', e_country:'Country', e_since:'Start of tenure', e_until:'End of tenure', e_pep_name:'PEP Name', e_pep_role:'PEP Position', e_kinship:'Degree of kinship', e_rel_type:'Type of relationship',
    f_title:'Required Documents', f_sub:'Upload each document. <span style="color:var(--err)">*</span> Required for submission.',
    f_id_clbl:'Identification & Tax', f_res_clbl:'Residence & Income', fcc_id_clbl:'Company Documents', fcc_doc_rc:'Commercial Register Certificate and RCBE', fcc_doc_ids:'Copy of identification documents of Holders', fcc_doc_nif:'Tax ID proof', fcc_doc_delib:'General Assembly Resolution / Power of Attorney',
    f_doc_id:'Copy of identification document(s) of Proposer(s)', f_doc_nif:'Tax ID proof', f_doc_poa:'Power of Attorney', if_applicable:'(if applicable)', f_doc_utility:'Utility bill less than 3 months old', f_doc_iban:'IBAN proof of the source account',
    f_doc_err:'Required document missing', f_doc_err_sel:'You selected this option — document is required',
    f_funds_clbl:'Proof of Source of Funds', f_funds_min:'— at least 1 required', f_doc_deed:'Deed / Asset purchase agreement', f_doc_bankdec:'Bank declaration of ownership and sufficiency', f_doc_stmt:'Bank statement', f_doc_payslip2:'Payslips / Tax return', f_doc_reports:'Account reports', f_doc_other_note:'(according to source of funds)', f_funds_err:'↑ At least one proof of source of funds is required',
    h_title:'Data Protection & Declarations', h_sub:'Please read carefully before signing.',
    h_gdpr_title:'Personal Data Protection', h_decl_title:'Proposer Declaration(s)',
    h_sign_clbl:'Signatures', h_how_title:'How it works', h_how_text:'Option A — Export the pre-filled form as PDF, sign physically and upload. Option B — Authenticate digitally with Mobile Digital Key.',
    h_export_btn:'Export pre-filled form (PDF)', h_export_skip:'Export without validation (draft)',
    h_p1_lbl:'Proposer 1', h_p2_lbl:'Proposer 2 / Legal Representative', h_place:'Place', h_date:'Date',
    h_cmd_btn:'Authenticate with Mobile Digital Key', h_upload_sign:'Upload physical signature', h_upload_click:'Click to upload the signed document', h_cmd_note:'CMD authentication is performed on the official Government portal.',
    legal_title:'Legal Definitions', legal_sub:'Law No. 83/2017 — for reference only.', legal_btn_open:'View legal notes', legal_btn_close:'Close legal notes',
    legal_pep_title:'Politically Exposed Persons (PEP)', legal_pep_text:'Individuals who hold or have held in the last 12 months senior public functions.', legal_be_title:'Beneficial Owner', legal_be_text:'The natural person(s) who ultimately own or control the client.', legal_family_title:'Close family members', legal_family_text:'(art. 2(1)(w)): spouse or civil partner; relatives to the 1st degree.', legal_assoc_title:'Closely associated persons', legal_assoc_text:'(art. 2(1)(dd)): co-owner with a PEP; holder of capital in a legal entity whose beneficial owner is a PEP.',
    bar_saved:'Progress saved', bar_sub:'Data is automatically saved in this browser.', bar_close:'Close', bar_submit:'Submit form', bar_save:'Save progress', bar_tab:'Action bar', prog_section:'Section', prog_of:'of',
    submit_pending:'⏳ Submission pending', submit_backend:'Backend not configured.', docs_missing:'⚠ Documents missing', docs_missing_sub:'Missing: {0}.', save_ok:'✓ Progress saved', save_time:'Saved at ', pdf_preview_title:'PDF Preview', pdf_download_btn:'Download PDF'
  }
};

function setType(type) {
  currentType = type;
  document.getElementById('btn-singular').classList.toggle('active', type === 'singular');
  document.getElementById('btn-coletiva').classList.toggle('active', type === 'coletiva');
  document.getElementById('section-singular').style.display = type === 'singular' ? '' : 'none';
  document.getElementById('section-coletiva').style.display = type === 'coletiva' ? '' : 'none';
  document.getElementById('docs-singular').style.display = type === 'singular' ? '' : 'none';
  document.getElementById('docs-coletiva').style.display = type === 'coletiva' ? '' : 'none';
  document.querySelectorAll('#section-singular [data-req-pt]').forEach(function(el) {
    if (type === 'singular') el.setAttribute('data-req', el.getAttribute('data-req-' + currentLang));
    else { el.removeAttribute('data-req'); el.classList.remove('err-field'); }
  });
  document.querySelectorAll('#section-coletiva [data-req-pt]').forEach(function(el) {
    if (type === 'coletiva') el.setAttribute('data-req', el.getAttribute('data-req-' + currentLang));
    else { el.removeAttribute('data-req'); el.classList.remove('err-field'); }
  });
  updateProgress();
  try { localStorage.setItem('alyx_kyc_type', type); } catch(e) {}
}

function addTitular() {
  titularCount++;
  var n = titularCount;
  var d = T[currentLang];
  var html = '<div class="titular-block" id="titular-' + n + '">' +
    '<div class="titular-hdr"><span class="titular-lbl">' + d.cc_titular_lbl + ' ' + n + '</span>' +
    '<button class="titular-remove" onclick="removeTitular(' + n + ')">' + d.cc_titular_remove + '</button></div>' +
    '<div class="g3">' +
    '<div class="f s2"><label class="req">' + d.tit_name + '</label><input type="text" name="tit_' + n + '_nome" data-req-pt="Nome Titular ' + n + '" data-req-en="Holder ' + n + ' Name"><span class="f-err">Campo obrigatório</span></div>' +
    '<div class="f"><label class="req">' + d.tit_cargo + '</label><input type="text" name="tit_' + n + '_cargo" data-req-pt="Cargo Titular ' + n + '" data-req-en="Holder ' + n + ' Position" placeholder="' + d.tit_cargo_ph + '"><span class="f-err">Campo obrigatório</span></div>' +
    '<div class="f"><label>' + d.tit_capital + '</label><input type="text" name="tit_' + n + '_capital"></div>' +
    '<div class="f"><label>' + d.tit_be + '</label><div class="opts" id="tit-be-opts-' + n + '"><div class="opt" onclick="toggleRad(this,\'tit-be-opts-' + n + '\')"><div class="odot"></div>' + d.yn_yes + '</div><div class="opt" onclick="toggleRad(this,\'tit-be-opts-' + n + '\')"><div class="odot"></div>' + d.yn_no + '</div></div></div>' +
    '<div class="f"><label class="req">' + d.tit_nac1 + '</label><input type="text" name="tit_' + n + '_nac1" data-req-pt="Nac. Titular ' + n + '" data-req-en="Holder ' + n + ' Nat."><span class="f-err">Campo obrigatório</span></div>' +
    '<div class="f"><label>' + d.tit_nac2 + '</label><input type="text" name="tit_' + n + '_nac2"></div>' +
    '<div class="f"><label class="req">' + d.tit_docnum + '</label><input type="text" name="tit_' + n + '_docnum" data-req-pt="N.º Doc. Titular ' + n + '" data-req-en="Holder ' + n + ' Doc No."><span class="f-err">Campo obrigatório</span></div>' +
    '<div class="f"><label>' + d.tit_emissao + '</label><input type="date" name="tit_' + n + '_emissao"></div>' +
    '<div class="f"><label class="req">' + d.tit_nif + '</label><input type="text" name="tit_' + n + '_nif" data-req-pt="NIF Titular ' + n + '" data-req-en="Holder ' + n + ' NIF"><span class="f-err">Campo obrigatório</span></div>' +
    '<div class="f"><label>' + d.tit_nif_est + '</label><input type="text" name="tit_' + n + '_nif_est"></div>' +
    '<div class="f s3"><label class="req">' + d.tit_res + '</label><input type="text" name="tit_' + n + '_res" data-req-pt="Residência Titular ' + n + '" data-req-en="Holder ' + n + ' Residence"><span class="f-err">Campo obrigatório</span></div>' +
    '<div class="f s3"><label>' + d.tit_resf + '</label><input type="text" name="tit_' + n + '_resf"></div>' +
    '</div></div>';
  var c = document.getElementById('titulares-container');
  var div = document.createElement('div');
  div.innerHTML = html;
  c.appendChild(div.firstChild);
  if (currentType === 'coletiva') {
    c.querySelectorAll('#titular-' + n + ' [data-req-pt]').forEach(function(el) {
      el.setAttribute('data-req', el.getAttribute('data-req-' + currentLang));
    });
  }
  c.querySelectorAll('#titular-' + n + ' input').forEach(function(el) {
    el.addEventListener('input', updateProgress);
  });
  updateProgress();
}
function removeTitular(n) {
  var el = document.getElementById('titular-' + n);
  if (el) el.parentNode.removeChild(el);
  updateProgress();
}

function setLang(lang) {
  currentLang = lang;
  document.getElementById('btn-pt').classList.toggle('active', lang === 'pt');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  var d = T[lang];
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var k = el.getAttribute('data-i18n');
    if (d[k] !== undefined) el.innerHTML = d[k];
  });
  document.querySelectorAll('[data-req-' + lang + ']').forEach(function(el) {
    if (el.hasAttribute('data-req')) el.setAttribute('data-req', el.getAttribute('data-req-' + lang));
  });
  document.getElementById('pdf-preview-label').textContent = d.pdf_preview_title;
  document.getElementById('pdf-dl-label').textContent = d.pdf_download_btn;
  var anx = document.getElementById('anx-body');
  if (anx) {
    var open = anx.classList.contains('open');
    document.getElementById('anx-txt').innerHTML = d[open ? 'legal_btn_close' : 'legal_btn_open'];
  }
  updateProgress();
  if (!cmdState[1]) document.getElementById('cmd-label-1').textContent = d.h_cmd_btn;
  if (!cmdState[2]) document.getElementById('cmd-label-2').textContent = d.h_cmd_btn;
}

function toggleChk(el) { el.classList.toggle('on'); updateProgress(); }
function toggleChkOutro(el, id) {
  el.classList.toggle('on');
  var o = document.getElementById(id);
  if (el.classList.contains('on')) { o.classList.add('show'); o.querySelector('input').focus(); }
  else { o.classList.remove('show'); }
  updateProgress();
}
function toggleRad(el, grp) {
  document.querySelectorAll('#' + grp + ' .opt').forEach(function(x) { x.classList.remove('on'); });
  el.classList.add('on');
  updateProgress();
}
function ynToggle(btn, id, type) {
  btn.closest('.yn').querySelectorAll('.yn-btn').forEach(function(b) { b.classList.remove('on'); });
  btn.classList.add('on');
  var det = document.getElementById(id);
  if (type === 'yes') {
    det.classList.add('open');
    det.querySelectorAll('[data-req-pt]').forEach(function(el) {
      el.setAttribute('data-req', el.getAttribute('data-req-' + currentLang));
    });
  } else {
    det.classList.remove('open');
    det.querySelectorAll('input,select').forEach(function(i) { i.value = ''; i.classList.remove('err-field', 'valid-field'); });
    det.querySelectorAll('.opt').forEach(function(o) { o.classList.remove('on'); });
    det.querySelectorAll('.f-err').forEach(function(e) { e.classList.remove('show'); });
    det.querySelectorAll('[data-req]').forEach(function(el) { el.removeAttribute('data-req'); });
  }
  updateProgress();
}
function toggleAnnex() {
  var open = document.getElementById('anx-body').classList.toggle('open');
  document.getElementById('anx-icon').textContent = open ? '−' : '+';
  document.getElementById('anx-txt').innerHTML = T[currentLang][open ? 'legal_btn_close' : 'legal_btn_open'];
}
function toggleIssuerOther(sel, outroId) {
  var o = document.getElementById(outroId);
  if (sel.value === 'outro') { o.classList.add('show'); o.querySelector('input').focus(); }
  else { o.classList.remove('show'); }
}
function checkFinPct() {
  var pct = document.getElementById('b_fin_pct');
  var bw = document.getElementById('banco-wrap');
  if (!pct || !bw) return;
  var val = parseFloat((pct.value || '0').replace(',', '.').replace('%', ''));
  var show = (!pct.value || val > 0);
  bw.style.display = show ? '' : 'none';
  var banc = document.getElementById('b_fin_banco');
  if (banc) {
    if (show) banc.setAttribute('data-req', currentLang === 'pt' ? 'Banco Financiador' : 'Financing Bank');
    else { banc.removeAttribute('data-req'); banc.classList.remove('err-field'); }
  }
}

var UPLOAD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M12 16V4M8 8l4-4 4 4"/><path d="M3 18v2a1 1 0 001 1h16a1 1 0 001-1v-2"/></svg>';
function docFileSet(input, key) {
  if (!input.files || !input.files.length) return;
  var files = Array.from(input.files);
  docFiles[key] = files;
  var btn = document.getElementById('upbtn-' + key);
  if (btn) {
    btn.style.borderColor = 'var(--ok)';
    btn.style.color = 'var(--ok)';
    btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><polyline points="3 8 6 11 13 4"/></svg>';
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.pdf,.jpg,.jpeg,.png'; inp.multiple = true; inp.style.display = 'none';
    inp.onchange = function() { docFileSet(inp, key); };
    btn.appendChild(inp);
  }
  var meta = document.getElementById('upmeta-' + key);
  var list = document.getElementById('upfiles-' + key);
  if (meta && list) { list.textContent = '✓ ' + files.map(function(f) { return f.name; }).join(' · '); meta.style.display = 'flex'; }
  var chk = input.closest('li').querySelector('.chk');
  if (chk && !chk.classList.contains('on')) chk.classList.add('on');
  updateProgress();
}
function fundRadToggle(chk, key) {
  var wasOn = chk.classList.contains('on');
  chk.classList.toggle('on', !wasOn);
  var upbtn = document.getElementById('upbtn-' + key);
  var err = document.getElementById('uperr-' + key);
  if (!wasOn) {
    // just selected — show upload button
    if (upbtn) upbtn.style.display = 'flex';
    if (err) err.style.display = 'none';
  } else {
    // deselected — hide upload button and clear
    if (upbtn) upbtn.style.display = 'none';
    if (err) err.style.display = 'none';
    docFiles[key] = null;
    var meta = document.getElementById('upmeta-' + key);
    var list = document.getElementById('upfiles-' + key);
    if (meta) meta.style.display = 'none';
    if (list) list.textContent = '';
    // reset upbtn icon
    var inp = document.getElementById('upinput-' + key);
    if (upbtn && inp) { upbtn.innerHTML = UPLOAD_ICON; upbtn.style.borderColor = ''; upbtn.style.color = ''; upbtn.appendChild(inp); }
  }
  updateProgress();
}


function validateRequired() {
  var errors = [];
  document.querySelectorAll('.err-field').forEach(function(el) { el.classList.remove('err-field'); });
  document.querySelectorAll('.f-err.show').forEach(function(el) { el.classList.remove('show'); });
  document.querySelectorAll('[data-req]').forEach(function(el) {
    if (currentModo === 'cliente' && el.closest('.readonly-section')) return;
    if (!el.value.trim()) {
      el.classList.add('err-field');
      var msg = el.nextElementSibling;
      if (msg && msg.classList.contains('f-err')) msg.classList.add('show');
      errors.push({label: el.getAttribute('data-req'), el: el});
    }
  });
  return errors;
}
function validateDocs() {
  var missing = [];
  var reqDocs = currentType === 'singular' ? ['f1','f3','f5','f7'] : ['cc1','cc2','cc5'];
  reqDocs.forEach(function(key) {
    var li = document.getElementById('li-' + key);
    if (!li) return;
    var hasFile = docFiles[key] && docFiles[key].length > 0;
    if (!hasFile) missing.push(li.querySelector('.ck-label').textContent.replace('*','').trim());
  });
  // funds: must have at least one selected AND uploaded
  var fundKeys = ['g1','g2','g3','g4','g5','g6'];
  var anySelected = false;
  var allSelectedHaveFile = true;
  fundKeys.forEach(function(k) {
    var li = document.getElementById('li-' + k);
    var chkOn = li && li.querySelector('.chk.on');
    if (chkOn) {
      anySelected = true;
      var hasFile = docFiles[k] && docFiles[k].length > 0;
      if (!hasFile) {
        allSelectedHaveFile = false;
        document.getElementById('uperr-' + k).style.display = 'block';
      } else {
        document.getElementById('uperr-' + k).style.display = 'none';
      }
    } else {
      document.getElementById('uperr-' + k).style.display = 'none';
    }
  });
  var fundErr = document.getElementById('uperr-fundos');
  if (!anySelected) { fundErr.style.display = 'block'; missing.push('Comprovativo da Origem de Fundos'); }
  else if (!allSelectedHaveFile) { fundErr.style.display = 'none'; missing.push('Upload em falta nos fundos selecionados'); }
  else { fundErr.style.display = 'none'; }
  return missing;
}

function showToast(errors) {
  var list = document.getElementById('toast-list');
  list.innerHTML = '';
  errors.forEach(function(e) {
    var li = document.createElement('li');
    li.textContent = e.label;
    if (e.el) { li.onclick = function() { e.el.scrollIntoView({behavior:'smooth',block:'center'}); e.el.focus(); closeToast(); }; }
    list.appendChild(li);
  });
  var t = document.getElementById('val-toast');
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(closeToast, 12000);
}
function closeToast() { document.getElementById('val-toast').classList.remove('show'); }
function closeBar() { document.getElementById('bar').style.display = 'none'; document.getElementById('bar-tab').style.display = 'flex'; }
function openBar() { document.getElementById('bar').style.display = 'flex'; document.getElementById('bar-tab').style.display = 'none'; }

function submitForm() {
  var fieldErr = validateRequired();
  if (fieldErr.length > 0) { showToast(fieldErr); fieldErr[0].el.scrollIntoView({behavior:'smooth',block:'center'}); return; }
  var docMissing = validateDocs();
  var d = T[currentLang];
  var title = document.getElementById('bar-title');
  var sub = document.getElementById('bar-sub');
  if (docMissing.length > 0) {
    title.textContent = d.docs_missing; title.style.color = 'var(--gold)';
    sub.textContent = d.docs_missing_sub.replace('{0}', docMissing.join(' · '));
    setTimeout(function() { title.textContent = d.bar_saved; title.style.color = ''; sub.textContent = d.bar_sub; }, 7000);
    return;
  }
  title.textContent = d.submit_pending; title.style.color = 'var(--gold)';
  sub.textContent = d.submit_backend;
  setTimeout(function() { title.textContent = d.bar_saved; title.style.color = ''; sub.textContent = d.bar_sub; }, 4000);
}

function saveProgress() {
  var data = {};
  document.querySelectorAll('input[type=text],input[type=date],input[type=month],input[type=email],input[type=tel],select,textarea').forEach(function(el) {
    if (el.name) data[el.name] = el.value;
  });
  try {
    localStorage.setItem('alyx_kyc', JSON.stringify(data));
    var d = T[currentLang];
    var title = document.getElementById('bar-title');
    title.textContent = d.save_ok; title.style.color = 'var(--ok)';
    document.getElementById('bar-sub').textContent = d.save_time + new Date().toLocaleTimeString(currentLang === 'pt' ? 'pt-PT' : 'en-GB', {hour:'2-digit',minute:'2-digit'});
    setTimeout(function() { title.textContent = d.bar_saved; title.style.color = ''; }, 3000);
  } catch(e) {}
}
function loadProgress() {
  try {
    var saved = localStorage.getItem('alyx_kyc');
    if (!saved) return;
    var data = JSON.parse(saved);
    document.querySelectorAll('input[type=text],input[type=date],input[type=month],input[type=email],input[type=tel],select,textarea').forEach(function(el) {
      if (el.name && data[el.name] !== undefined) el.value = data[el.name];
    });
    updateProgress();
  } catch(e) {}
}

function updateProgress() {
  var inp = document.querySelectorAll('input[type=text],input[type=date],input[type=month],input[type=email],input[type=tel]');
  var done = 0;
  inp.forEach(function(i) { if (i.value.trim()) done++; });
  var sel = document.querySelectorAll('.opt.on,.yn-btn.on,.chk.on').length;
  var cmd = (cmdState[1] ? 1 : 0) + (cmdState[2] ? 1 : 0);
  var pct = inp.length ? Math.min(100, Math.round((done + sel * 0.5 + cmd * 2) / inp.length * 100)) : 0;
  document.getElementById('prog-bar').style.width = pct + '%';
  document.getElementById('prog-pct').textContent = pct + '%';
  var sec = Math.min(SECTIONS, Math.floor(pct / 100 * SECTIONS) + 1);
  var d = T[currentLang];
  document.getElementById('prog-label').textContent = d.prog_section + ' ' + sec + ' ' + d.prog_of + ' ' + SECTIONS;
  document.querySelectorAll('.sd').forEach(function(dot, i) {
    dot.className = 'sd' + (i < sec - 1 ? ' done' : i === sec - 1 ? ' active' : '');
  });
}

function openCmd(n) {
  var nome = (document.getElementById('h' + n + '_nome') || {}).value || '';
  var status = document.getElementById('cmd-status-' + n);
  document.getElementById('cmd-label-' + n).textContent = currentLang === 'pt' ? 'A aguardar confirmação…' : 'Awaiting confirmation…';
  status.className = 'cmd-st pending';
  var ct = currentLang === 'pt' ? '✓ Confirmar' : '✓ Confirm';
  var cc = currentLang === 'pt' ? 'Cancelar' : 'Cancel';
  var co = currentLang === 'pt' ? 'Portal CMD aberto.' : 'CMD portal opened.';
  status.innerHTML = co + (nome ? ' (' + nome + ')' : '') + ' <br><br><button class="confirm-btn" onclick="confirmCmd(' + n + ')">' + ct + '</button><button class="cancel-btn" onclick="cancelCmd(' + n + ')">' + cc + '</button>';
  var a = document.createElement('a'); a.href = 'https://autenticacao.gov.pt'; a.target = '_blank'; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
function confirmCmd(n) {
  var nome = (document.getElementById('h' + n + '_nome') || {}).value || '';
  cmdState[n] = true;
  var status = document.getElementById('cmd-status-' + n);
  status.className = 'cmd-st done';
  status.innerHTML = '✓ ' + (currentLang === 'pt' ? 'Autenticado' : 'Authenticated') + (nome ? ' — ' + nome : '');
  document.getElementById('cmd-btn-' + n).style.cssText = 'border-color:var(--ok);color:var(--ok);background:var(--ok-bg)';
  document.getElementById('cmd-label-' + n).textContent = currentLang === 'pt' ? 'Autenticação concluída' : 'Authentication complete';
  updateProgress();
}
function cancelCmd(n) {
  document.getElementById('cmd-status-' + n).className = 'cmd-st pending';
  document.getElementById('cmd-status-' + n).textContent = currentLang === 'pt' ? 'Autenticação pendente.' : 'Authentication pending.';
  document.getElementById('cmd-label-' + n).textContent = T[currentLang].h_cmd_btn;
}
function handleUpload(input, n) {
  if (input.files && input.files[0]) {
    var area = document.getElementById('upload-area-' + n);
    var nameEl = document.getElementById('upload-name-' + n);
    if (area) { area.classList.add('has-file'); area.querySelector('p').textContent = currentLang === 'pt' ? 'Documento carregado' : 'Document uploaded'; }
    if (nameEl) { nameEl.style.display = 'block'; nameEl.textContent = '✓ ' + input.files[0].name; }
    updateProgress();
  }
}

function genRef() { var y = new Date().getFullYear(); return 'ALYX-' + y + '-' + String(Math.floor(Math.random() * 9000) + 1000); }
(function() {
  var el = document.getElementById('ref_interna');
  if (!el) return;
  var saved = '';
  try { var s = localStorage.getItem('alyx_kyc'); if (s) { var d = JSON.parse(s); saved = d['ref_interna'] || ''; } } catch(e) {}
  el.value = saved || genRef();
})();

var currentTheme = localStorage.getItem('alyx_theme') || 'dark';
function applyTheme(t) {
  currentTheme = t;
  document.body.classList.toggle('light', t === 'light');
  document.getElementById('theme-icon-dark').style.display = t === 'light' ? 'block' : 'none';
  document.getElementById('theme-icon-light').style.display = t === 'dark' ? 'block' : 'none';
  try { localStorage.setItem('alyx_theme', t); } catch(e) {}
}
function toggleTheme() { applyTheme(currentTheme === 'dark' ? 'light' : 'dark'); }
applyTheme(currentTheme);

var currentFontSize = localStorage.getItem('alyx_font') || 'normal';
function applyFontSize(s) {
  currentFontSize = s;
  document.body.classList.toggle('large-text', s === 'large');
  var btn = document.getElementById('font-btn');
  if (btn) { btn.style.borderColor = s === 'large' ? 'var(--gold)' : ''; btn.style.color = s === 'large' ? 'var(--gold)' : ''; }
  try { localStorage.setItem('alyx_font', s); } catch(e) {}
}
function toggleFontSize() { applyFontSize(currentFontSize === 'normal' ? 'large' : 'normal'); }
applyFontSize(currentFontSize);

function closePDFModal() { document.getElementById('pdf-modal').classList.remove('show'); pdfDoc = null; }
function downloadPDF() { if (pdfDoc) { var f = collectFields(); pdfDoc.save('ALYX_KYC_' + (f['ref_interna'] || 'form').replace(/[^a-zA-Z0-9_-]/g,'_') + '.pdf'); } }
function collectFields() {
  var f = {};
  document.querySelectorAll('input[type=text],input[type=date],input[type=month],input[type=email],input[type=tel],select').forEach(function(el) {
    if (el.name && el.value.trim()) f[el.name] = el.value.trim();
  });
  var refEl = document.getElementById('ref_interna');
  if (refEl && !f['ref_interna']) f['ref_interna'] = refEl.value || genRef();
  return f;
}
function fv(f, k) { return f[k] || '—'; }
function getSelected(grpId) {
  var labels = [];
  document.querySelectorAll('#' + grpId + ' .opt.on').forEach(function(el) { labels.push(el.textContent.trim()); });
  return labels.join(', ') || '—';
}

function buildPreviewHTML(f) {
  var d = T[currentLang];
  function row(l, v) { return '<div class="pdf-row"><div class="pdf-row-lbl">' + l + '</div><div class="pdf-row-val">' + (v || '—') + '</div></div>'; }
  function sec(t) { return '<div class="pdf-sec">' + t + '</div>'; }
  var html = '<div class="pdf-preview-page"><div class="pdf-wm">CONFIDENTIAL</div>';
  html += '<div class="pdf-hdr-band"><div><div class="pdf-logo-main">ALYX</div><div class="pdf-logo-sub">Properties</div></div><div class="pdf-meta"><strong>KYC</strong>AMI n.º 20468<br><em>Ref: ' + fv(f,'ref_interna') + '</em></div></div>';
  html += '<div class="pdf-inner">';
  html += sec('A — ' + d.a_title) + row(d.a_address, fv(f,'a_morada')) + row(d.a_cp, fv(f,'a_cp')) + row(d.a_city, fv(f,'a_local')) + row(d.a_owner, fv(f,'a_prop'));
  html += sec('B — ' + d.b_title) + row(d.b_purpose, fv(f,'b_prop')) + row(d.b_value, fv(f,'b_valor') + ' €') + row(d.b_signal, fv(f,'b_sinal') + ' €') + row(d.b_funds, getSelected('fund-opts'));
  if (currentType === 'singular') {
    html += sec('C — ' + d.c_title) + row(d.c_name, fv(f,'c1_nome')) + row(d.c_dob, fv(f,'c1_nasc')) + row(d.c_nationality, fv(f,'c1_nac')) + row(d.c_nif, fv(f,'c1_nif')) + row(d.c_phone, fv(f,'c1_tel')) + row(d.c_email, fv(f,'c1_email'));
  } else {
    html += sec('C — ' + d.cc_title) + row(d.cc_denom, fv(f,'cc_denom')) + row(d.cc_nipc, fv(f,'cc_nipc')) + row(d.cc_objeto, fv(f,'cc_objeto')) + row(d.cc_sede, fv(f,'cc_sede'));
  }
  html += sec('H — ' + d.h_sign_clbl);
  html += '<div class="pdf-sign-grid"><div><div class="pdf-sign-lbl">' + d.h_p1_lbl + '</div><p style="font-size:9px">' + d.c_name + ': <strong>' + fv(f,'h1_nome') + '</strong></p><p style="font-size:9px">' + d.h_date + ': ' + fv(f,'h1_data') + '</p><div class="pdf-sign-line"></div></div>';
  html += '<div><div class="pdf-sign-lbl">' + d.h_p2_lbl + '</div><p style="font-size:9px">' + d.c_name + ': <strong>' + fv(f,'h2_nome') + '</strong></p><p style="font-size:9px">' + d.h_date + ': ' + fv(f,'h2_data') + '</p><div class="pdf-sign-line"></div></div></div>';
  html += '</div><div class="pdf-ftr"><span>ALYX Properties, Lda · Av. da Liberdade, 110, 5.º, Lisboa</span><span>www.alyxproperties.eu</span></div></div>';
  return html;
}
function openDraftPDF() { var f = collectFields(); document.getElementById('pdf-preview-wrap').innerHTML = buildPreviewHTML(f); document.getElementById('pdf-modal').classList.add('show'); if (window.jspdf && window.jspdf.jsPDF) buildPDF(); }
function runExport(skip) { if (skip) { openDraftPDF(); return; } var errors = validateRequired(); if (errors.length > 0) { showToast(errors); errors[0].el.scrollIntoView({behavior:'smooth',block:'center'}); return; } openDraftPDF(); }

function buildPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) return;
  var doc = new window.jspdf.jsPDF({unit:'mm',format:'a4'});
  var f = collectFields(), LM = 16, RM = 194, PW = RM - LM, y = 0, LH = 5.2, PAGE_H = 280;
  function np() { doc.addPage(); y = 28; hdr(); wm(); }
  function ck(n) { if (y + (n || LH) > PAGE_H) np(); }
  function wm() { doc.saveGraphicsState(); doc.setGState(new doc.GState({opacity:0.04})); doc.setFontSize(52); doc.setFont('helvetica','bold'); doc.setTextColor(0,0,0); doc.text('CONFIDENTIAL',105,160,{align:'center',angle:45}); doc.restoreGraphicsState(); }
  function hdr() { doc.setFillColor(10,10,10); doc.rect(0,0,210,24,'F'); doc.setFontSize(16); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255); doc.setCharSpace(4); doc.text('ALYX',LM,13); doc.setCharSpace(0); doc.setFontSize(6); doc.setFont('helvetica','normal'); doc.setTextColor(201,169,110); doc.setCharSpace(3); doc.text('PROPERTIES',LM,19); doc.setCharSpace(0); doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255); doc.text('KYC',RM,10,{align:'right'}); doc.setFontSize(6.5); doc.setFont('helvetica','normal'); doc.setTextColor(160,160,160); doc.text('AMI n.º 20468  ·  NIPC 516351974',RM,15,{align:'right'}); doc.setTextColor(201,169,110); doc.text('Ref: '+fv(f,'ref_interna'),RM,20,{align:'right'}); }
  function ftr() { var pg = doc.getNumberOfPages(); doc.setPage(pg); doc.setFillColor(10,10,10); doc.rect(0,287,210,10,'F'); doc.setFontSize(6.5); doc.setFont('helvetica','normal'); doc.setTextColor(120,120,120); doc.text('ALYX Properties, Lda  ·  Av. da Liberdade, 110, 5.º, 1250-146 Lisboa',LM,293); doc.setTextColor(201,169,110); doc.text('? / ?',RM,293,{align:'right'}); }
  function sec(t) { ck(14); y += 6; doc.setDrawColor(201,169,110); doc.setLineWidth(0.3); doc.line(LM,y,RM,y); y += 5; doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(180,140,80); doc.text(t.toUpperCase(),LM,y); y += LH + 2; }
  function row(l, v) { ck(LH+1); doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(120,120,120); doc.text(l,LM,y); doc.setFont('helvetica','normal'); doc.setTextColor(25,25,25); var lines = doc.splitTextToSize(String(v || '—'), PW - 52); doc.text(lines,LM+52,y); y += Math.max(LH, lines.length * LH); }
  hdr(); wm(); y = 32;
  var d = T[currentLang];
  sec('A — ' + d.a_title); row(d.a_address, fv(f,'a_morada')); row(d.a_cp, fv(f,'a_cp')); row(d.a_city, fv(f,'a_local')); row(d.a_owner, fv(f,'a_prop')); row(d.a_nipc, fv(f,'a_nipc'));
  if (f['g_denom']) { sec('G — ' + d.g_title); row(d.g_company, fv(f,'g_denom')); row(d.g_ami, fv(f,'g_ami')); }
  sec('B — ' + d.b_title); row(d.b_purpose, fv(f,'b_prop')); row(d.b_value, fv(f,'b_valor') + ' €'); row(d.b_signal, fv(f,'b_sinal') + ' €'); row(d.b_deadline, fv(f,'b_prazo')); row(d.b_funds, getSelected('fund-opts')); row(d.b_iban_transfer, fv(f,'b_transf_iban'));
  if (currentType === 'singular') {
    sec('C — ' + d.c_title); row(d.c_name, fv(f,'c1_nome')); row(d.c_dob, fv(f,'c1_nasc')); row(d.c_birth_place, fv(f,'c1_nat')); row(d.c_nationality, fv(f,'c1_nac')); row(d.c_nif, fv(f,'c1_nif')); row(d.c_phone, fv(f,'c1_tel')); row(d.c_email, fv(f,'c1_email'));
    if (document.querySelector('.yn-btn.yes.on[onclick*="conj_det"]')) { sec(d.conj_clbl); row(d.c_name, fv(f,'conj_nome')); row(d.c_nif, fv(f,'conj_nif')); }
  } else {
    sec('C — ' + d.cc_title); row(d.cc_denom, fv(f,'cc_denom')); row(d.cc_nipc, fv(f,'cc_nipc')); row(d.cc_objeto, fv(f,'cc_objeto')); row(d.cc_sede, fv(f,'cc_sede')); row(d.cc_forma, fv(f,'cc_forma')); row(d.cc_pais_const, fv(f,'cc_pais_const')); row(d.cc_rcbe_code, fv(f,'cc_rcbe'));
    var tc = document.getElementById('titulares-container');
    if (tc) { var blocks = tc.querySelectorAll('.titular-block'); if (blocks.length > 0) { sec('E — ' + d.cc_titulares_title); blocks.forEach(function(b) { var id = b.id.replace('titular-',''); row(d.tit_name, fv(f,'tit_'+id+'_nome')); row(d.tit_cargo, fv(f,'tit_'+id+'_cargo')); row(d.tit_nif, fv(f,'tit_'+id+'_nif')); y += 2; }); } }
  }
  if (document.querySelector('.yn-btn.yes.on[onclick*="rep_det"]')) { sec('D — ' + d.d_title); row(d.c_name, fv(f,'d_nome')); row(d.c_nif, fv(f,'d_nif')); }
  sec('E/F — ' + d.e_title);
  [[d.e_q1_lbl,'p1d','p1_int'],[d.e_q2_lbl,'p2d','p2_int'],[d.e_q3_lbl,'p3d','p3_int'],[d.e_q4_lbl,'p4d','p4_int']].forEach(function(q) {
    var yn = document.querySelector('.yn-btn.yes.on[onclick*="' + q[1] + '"]');
    row(q[0], yn ? d.yn_yes + (f[q[2]] ? ' — ' + f[q[2]] : '') : d.yn_no);
  });
  sec('H — ' + d.h_sign_clbl); ck(60); y += 4;
  var sy = y, cw = (PW - 10) / 2;
  doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(140,140,140); doc.text(d.h_p1_lbl.toUpperCase(),LM,y); y += 5;
  doc.setFontSize(8.5); doc.setFont('helvetica','normal'); doc.setTextColor(25,25,25); doc.text(d.c_name + ': ' + fv(f,'h1_nome'),LM,y); y += 5; doc.text(d.h_date + ': ' + fv(f,'h1_data'),LM,y); y += 6;
  doc.setFontSize(7); doc.setTextColor(140,140,140); doc.text(currentLang === 'pt' ? 'Assinatura' : 'Signature',LM,y); y += 4;
  doc.setDrawColor(40,40,40); doc.setLineWidth(0.3); doc.line(LM,y,LM+cw,y); var yp1 = y + 4;
  y = sy; var x2 = LM + cw + 10;
  doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(140,140,140); doc.text(d.h_p2_lbl.toUpperCase(),x2,y); y += 5;
  doc.setFontSize(8.5); doc.setFont('helvetica','normal'); doc.setTextColor(25,25,25); doc.text(d.c_name + ': ' + fv(f,'h2_nome'),x2,y); y += 5; doc.text(d.h_date + ': ' + fv(f,'h2_data'),x2,y); y += 6;
  doc.setFontSize(7); doc.setTextColor(140,140,140); doc.text(currentLang === 'pt' ? 'Assinatura' : 'Signature',x2,y); y += 4;
  doc.setDrawColor(40,40,40); doc.setLineWidth(0.3); doc.line(x2,y,x2+cw,y);
  y = Math.max(yp1, y + 4) + 6;
  doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(140,140,140);
  doc.text('(*) ' + (currentLang === 'pt' ? 'Assinatura conforme documento de identificação.' : 'Signature as per identification document.'), LM, y);
  var total = doc.getNumberOfPages();
  for (var p = 1; p <= total; p++) { doc.setPage(p); ftr(); doc.setFontSize(6.5); doc.setTextColor(201,169,110); doc.text(p + ' / ' + total, RM, 293, {align:'right'}); }
  pdfDoc = doc;
}

/* ── INIT ── */
var stepsEl = document.getElementById('steps');
for (var i = 0; i < SECTIONS; i++) {
  var dot = document.createElement('div');
  dot.className = 'sd' + (i === 0 ? ' active' : '');
  stepsEl.appendChild(dot);
}
document.querySelectorAll('.ck-upbtn').forEach(function(btn) {
  var inp = btn.querySelector('input[type=file]');
  btn.innerHTML = UPLOAD_ICON;
  btn.title = 'Carregar';
  if (inp) btn.appendChild(inp);
});
document.querySelectorAll('[data-req-pt]').forEach(function(el) {
  el.setAttribute('data-req', el.getAttribute('data-req-pt'));
});
document.querySelectorAll('input,textarea,select').forEach(function(el) {
  el.addEventListener('input', updateProgress);
  el.addEventListener('change', updateProgress);
});
document.addEventListener('input', function(e) {
  if (e.target.classList && e.target.classList.contains('err-field')) {
    e.target.classList.remove('err-field');
    var msg = e.target.nextElementSibling;
    if (msg && msg.classList.contains('f-err')) msg.classList.remove('show');
  }
});
var savedType = localStorage.getItem('alyx_kyc_type');
setType(savedType && savedType !== 'singular' ? savedType : 'singular');
checkFinPct();
loadProgress();
if (currentTy