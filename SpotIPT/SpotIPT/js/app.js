// Registar o nosso "main" para quando o DOM está carregado.
// O 'DOMContentLoaded' é executado ligeiramente antes do 'load',
// logo, quando possível, deve ser usado.
document.addEventListener('DOMContentLoaded', function main(e) {
    var discoteca = document.querySelector('#discoteca');

    var dateFormat = new Intl.DateTimeFormat(
        navigator.language,
        {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }
    );

    var xhr = new XMLHttpRequest();

    xhr.open('GET', '/assets/xml/discot.xml');  // Configurar o URL para obter o XML.

    xhr.onload = function xmlLoaded(e) {  // Executado quando o conteúdo é carregado.
        if (xhr.status === 200) {  // OK
            var xml = xhr.responseXML;

            // 'xml' é um documento, tal como o 'document'.
            // Podemos desempenhar as mesmas tarefas nele que no 'document'.
            //console.log(xml);  
            
            var cds = xml.querySelectorAll('cd');

            cdList(cds);

            document.querySelector('#album-search').addEventListener('input', function (e) {
                var searchTerm = e.target.value.trim();

                discoteca.innerHTML = '';

                console.log(searchTerm);

                if (searchTerm.length > 0) {
                    var filteredCds = xml.querySelectorAll(`cd[titulo*="${searchTerm}"]`);

                    //console.log(filteredCds);

                    cdList(filteredCds);
                } else {
                    cdList(xml.querySelectorAll('cd'));
                }
            });

            document.querySelector('#detalhes-album-modal > button').addEventListener('click', function (e) {
                /**
                 * @type {HTMLButtonElement}
                 */
                var btn = e.target;

                var modal = btn.closest('#detalhes-album-modal');

                modal.classList.add('hidden');
            })

        } else {  // Erro
            console.error(`Status ${xhr.status}`, xhr.responseText);
        }
    };

    xhr.onerror = function communicationsError(e) {  // Problema de comunicação.
        console.error('An error occured.', e);
    };

    xhr.send();  // Enviar o pedido.

    function cdList(cds) {
        // Colocar os CDs do XML na página.

        for (var i = 0; i < cds.length; i++) {
            var cd = cds[i];

            var ui = cdUi(cd);

            discoteca.appendChild(ui);
        }
    }

    function discoUi(disco, searchTerm) {
        var container = document.createElement('div');

        var lblNumDisco = document.createElement('p');
        lblNumDisco.textContent = `Disco ${disco.getAttribute('disco')}`;
        container.appendChild(lblNumDisco);

        var faixas = null;

        if (searchTerm.length > 0) {
            faixas = disco.querySelectorAll(`faixa[ref*="${searchTerm}"`);
        } else {
            faixas = disco.querySelectorAll('faixa');
        }

        var listFaixas = document.createElement('ol');

        for (var f = 0; f < faixas.length; f++) {
            var faixa = faixas[f];

            var liFaixa = document.createElement('li');
            liFaixa.textContent = faixa.getAttribute('ref');
            listFaixas.appendChild(liFaixa);
        }

        container.appendChild(listFaixas);

        return container;
    }

    function trackList(cd, searchTerm) {
        var container = document.createElement('div');

        var discos = cd.querySelectorAll('conteudo');

        for (var d = 0; d < discos.length; d++) {
            var disco = discos[d];

            container.appendChild(discoUi(disco, searchTerm));
        }

        return container;
    }

    function faixasUi(cd) {
        var faixasContainer = document.createElement('div');

        var searchInput = document.createElement('input');
        searchInput.type = 'search';

        var faixas = null;

        searchInput.addEventListener('input', function (e) {
            faixas.remove();

            faixas = trackList(cd, e.target.value.trim());

            faixasContainer.appendChild(faixas);
        });

        faixasContainer.appendChild(searchInput);

        faixas = trackList(cd, '');
        faixasContainer.appendChild(faixas);
        
        return faixasContainer;
    }

    function cdUi(cd) {
        var container = document.createElement('div');
        container.classList.add('discoteca-cd-item');

        container.appendChild(cabecalhoCd(cd));
        
        //container.appendChild(faixasUi(cd));

        return container;
    }

    function cabecalhoCd(cd) {
        var container = document.createElement('div');
        container.classList.add('cabecalho-cd');

        var capa = cd.querySelector('capa');
        var albumImage = document.createElement('img');
        albumImage.classList.add('cd-imagem');
        albumImage.src = `/assets/images/${capa.getAttribute("imagMini")}`;

        var albumImageContainer = document.createElement('div');
        albumImageContainer.appendChild(albumImage);

        container.appendChild(albumImageContainer);

        var titulo = cd.getAttribute('titulo');
        var tituloContainer = document.createElement('p');

        var tituloLink = document.createElement('a');
        tituloLink.addEventListener('click', function () {
            var modal = document.querySelector('#detalhes-album-modal');

            var detalhesAlbum = modal.querySelector('#detalhes-album');

            detalhesAlbum.innerHTML = '';
            detalhesAlbum.appendChild(faixasUi(cd));

            modal.classList.remove('hidden');
        });

        tituloLink.textContent = titulo;

        tituloContainer.appendChild(tituloLink);

        container.appendChild(tituloContainer);

        var data = cd.querySelector('data');
        var albumDate = new Date(Date.UTC(
            parseInt(data.getAttribute('ano'), 10),
            parseInt(data.getAttribute('mes'), 10) - 1,
            parseInt(data.getAttribute('dia'), 10)
        ));

        var lblAlbumDate = document.createElement('time');
        lblAlbumDate.dateTime = albumDate.toISOString();
        lblAlbumDate.textContent = dateFormat.format(albumDate);
        container.appendChild(lblAlbumDate);

        var amazon = cd.getAttribute('amazon');
        var linkAmazon = document.createElement('a');
        linkAmazon.href = `https://${amazon}`;
        linkAmazon.textContent = 'Comprar no Amazon';
        container.appendChild(linkAmazon);
        
        return container;

    }
});
